import { spawn, ChildProcess } from "child_process";
import { ActionInfo } from "./info";

export class Requester {
  public async executeAsync(info: ActionInfo): Promise<void> {
    spawn("wsxhub", ["--timeout", "3", "send", "--json", JSON.stringify(info)]);
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
