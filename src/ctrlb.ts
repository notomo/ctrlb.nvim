import { Requester } from "./requester";
import { ArgParser } from "./info";
import { BufferOpener } from "./buffer";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser,
    protected readonly opener: BufferOpener
  ) {}

  public async requestAsync(arg: string): Promise<void> {
    const actionInfo = this.argParser.parse(arg);
    this.requester.executeAsync(actionInfo);
    return;
  }

  public async open(arg: string): Promise<void> {
    const bufferOpenInfos = this.argParser.parseBufferOpenArg(arg);
    return await this.opener.open(bufferOpenInfos);
  }
}
