import { spawn, ChildProcess, execFile } from "child_process";
import { ActionInfo } from "./info";
import { promisify } from "util";
const promisifyExecFile = promisify(execFile);

export class Requester {
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

  public receiveAsync(keyFilter: any, filter: any): ChildProcess {
    return spawn("wsxhub", [
      "--key",
      JSON.stringify(keyFilter),
      "--filter",
      JSON.stringify(filter),
      "receive",
    ]);
  }
}
