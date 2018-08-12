import { Requester } from "./requester";
import { ArgParser } from "./info";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser
  ) {}

  public requestAsync(arg: string): void {
    const actionInfo = this.argParser.parse(arg);
    this.requester.executeAsync(actionInfo);
  }
}
