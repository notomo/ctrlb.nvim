import { Requester } from "./requester";
import { ArgParser } from "./info";
import { BufferOpener } from "./buffer";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser,
    protected readonly opener: BufferOpener
  ) {}

  public requestAsync(arg: string): void {
    const actionInfo = this.argParser.parse(arg);
    this.requester.executeAsync(actionInfo);
  }

  public open(arg: string): void {
    const bufferOpenInfos = this.argParser.parseBufferOpenArg(arg);
    this.opener.open(bufferOpenInfos);
  }
}
