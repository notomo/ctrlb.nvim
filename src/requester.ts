import { spawn } from "child_process";
import { ActionInfo } from "./info";

export class Requester {
  public executeAsync(info: ActionInfo) {
    spawn("wsxhub", ["--timeout", "3", "send", "--json", JSON.stringify(info)]);
  }
}
