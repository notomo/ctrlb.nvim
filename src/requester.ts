import { spawn, ChildProcess, execFile } from "child_process";
import { ActionInfo } from "./info";
import { promisify } from "util";
import { Logger, getLogger } from "./logger";
const promisifyExecFile = promisify(execFile);

export class Requester {
  protected readonly logger: Logger;

  constructor() {
    this.logger = getLogger("requester");
  }

  public async executeAsync(info: ActionInfo): Promise<ChildProcess> {
    return spawn("wsxhub", [
      "--timeout",
      "3",
      "send",
      "--json",
      JSON.stringify(info),
    ]);
  }

  public async execute<T>(info: ActionInfo): Promise<T> {
    const result = await promisifyExecFile(
      "wsxhub",
      ["--timeout", "3", "send", "--json", JSON.stringify(info)],
      { timeout: 4000 }
    );

    const stdout: { body: T } = JSON.parse(result.stdout.trim().split("\n")[0]);
    return stdout.body;
  }

  public receiveAsyncOnEvent<T>(
    keyFilter: any,
    filter: any,
    eventCallback: { (arg: T): any }
  ): void {
    const p = spawn("wsxhub", [
      "--key",
      JSON.stringify(keyFilter),
      "--filter",
      JSON.stringify(filter),
      "receive",
    ]);

    p.stdout.setEncoding("utf-8");
    p.stdout.on("data", data => {
      const stdout: { body: T } = JSON.parse(data.trim().split("\n")[0]);
      eventCallback(stdout.body);
    });
  }
}
