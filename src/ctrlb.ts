import { Requester } from "./requester";
import { ArgParser } from "./info";
import { BufferOpener } from "./buffer";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser,
    protected readonly opener: BufferOpener
  ) {}

  public requestAsync(arg: string): Promise<void> {
    const actionInfo = this.argParser.parse(arg);
    return this.requester.executeAsync(actionInfo);
  }

  public open(arg: string): Promise<void> {
    const bufferOpenInfos = this.argParser.parseBufferOpenArg(arg);
    return this.opener.open(bufferOpenInfos);
  }
}
