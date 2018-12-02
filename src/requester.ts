import { spawn, ChildProcess, execFile } from "child_process";
import { ActionInfo } from "./info";
import { promisify } from "util";
import { Logger, getLogger } from "./logger";
import { Reporter } from "./reporter";
import { WithError, NullableError } from "./error";
const promisifyExecFile = promisify(execFile);

export class Requester {
  protected readonly logger: Logger;

  constructor(protected readonly reporter: Reporter) {
    this.logger = getLogger("requester");
  }

  public async executeAsync(info: ActionInfo): Promise<NullableError> {
    const result = await promisifyExecFile(
      "wsxhub",
      ["--timeout", "3", "send", "--json", JSON.stringify(info)],
      { timeout: 4000 }
    ).catch(e => {
      return e;
    });

    if (result.name !== undefined) {
      const error = {
        name: result.name,
        message: result.message,
        stack: result.stack,
      };
      await this.reporter.error(error);
      return error;
    }

    const stdout: {
      error?: { data: { name: string }; message: string };
    } = JSON.parse(result.stdout.trim().split("\n")[0]);

    if (stdout.error !== undefined) {
      const error = {
        name: stdout.error.data.name,
        message: stdout.error.message,
      };
      await this.reporter.error(error);
      return error;
    }

    return null;
  }

  public async execute<T>(info: ActionInfo): Promise<WithError<T | null>> {
    const result = await promisifyExecFile(
      "wsxhub",
      ["--timeout", "3", "send", "--json", JSON.stringify(info)],
      { timeout: 4000 }
    ).catch(e => {
      return e;
    });

    if (result.name !== undefined) {
      const error = {
        name: result.name,
        message: result.message,
        stack: result.stack,
      };
      await this.reporter.error(error);
      return [null, error];
    }

    const stdout: {
      body: { data: T };
      error?: { data: { name: string }; message: string };
    } = JSON.parse(result.stdout.trim().split("\n")[0]);

    if (stdout.error !== undefined) {
      const error = {
        name: stdout.error.data.name,
        message: stdout.error.message,
      };
      await this.reporter.error(error);
      return [null, error];
    }

    return [stdout.body.data, null];
  }

  public receiveAsyncOnEvent<T>(
    keyFilter: any,
    filter: any,
    regexFilter: any,
    eventCallback: { (arg: T): any },
    debounceInterval: number = 0
  ): ChildProcess {
    const p = spawn("wsxhub", [
      "--key",
      JSON.stringify(keyFilter),
      "--filter",
      JSON.stringify(filter),
      "--regex",
      JSON.stringify(regexFilter),
      "receive",
      "--debounce",
      debounceInterval.toString(),
    ]);

    p.stdout.setEncoding("utf-8");
    p.stdout.on("data", data => {
      const stdout: { body: { data: T } } = JSON.parse(
        data.trim().split("\n")[0]
      );
      eventCallback(stdout.body.data);
    });

    return p;
  }
}
