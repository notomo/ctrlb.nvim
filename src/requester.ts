import { spawn, ChildProcess, execFile } from "child_process";
import { ActionInfo } from "./info";
import { promisify } from "util";
import { Logger, getLogger } from "./logger";
import { Reporter } from "./reporter";
import { ConfigRepository } from "./repository/config";
import { WithError, NullableError } from "./error";
const promisifyExecFile = promisify(execFile);

export class Requester {
  protected readonly logger: Logger;

  constructor(
    protected readonly reporter: Reporter,
    protected readonly configRepository: ConfigRepository
  ) {
    this.logger = getLogger("requester");
  }

  public async executeAsync(info: ActionInfo): Promise<NullableError> {
    const client = await this.configRepository.getExecutableClient();
    const timeout = await this.configRepository.getTimeout();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];
    const result = await promisifyExecFile(
      client,
      portOption.concat([
        "--timeout",
        String(timeout),
        "send",
        "--json",
        JSON.stringify(info),
      ]),
      { timeout: (timeout + 1) * 1000 }
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
    const client = await this.configRepository.getExecutableClient();
    const timeout = await this.configRepository.getTimeout();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];
    const result = await promisifyExecFile(
      client,
      portOption.concat([
        "--timeout",
        String(timeout),
        "send",
        "--json",
        JSON.stringify(info),
      ]),
      { timeout: (timeout + 1) * 1000 }
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

  public async receiveAsyncOnEvent<T>(
    keyFilter: any,
    filter: any,
    regexFilter: any,
    eventCallback: { (arg: T): any },
    debounceInterval: number = 0
  ): Promise<ChildProcess> {
    const client = await this.configRepository.getExecutableClient();
    const port = await this.configRepository.getPort();
    const portOption = port === null ? [] : ["--port", String(port)];
    const p = spawn(
      client,
      portOption.concat([
        "--key",
        JSON.stringify(keyFilter),
        "--filter",
        JSON.stringify(filter),
        "--regex",
        JSON.stringify(regexFilter),
        "receive",
        "--debounce",
        debounceInterval.toString(),
      ])
    );

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
