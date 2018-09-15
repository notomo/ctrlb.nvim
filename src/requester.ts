import { spawn } from "child_process";
import { ActionInfo } from "./info";

export class Requester {
  public async executeAsync(info: ActionInfo): Promise<void> {
    spawn("wsxhub", ["--timeout", "3", "send", "--json", JSON.stringify(info)]);
  }
}
