import { Requester } from "./requester";
import { ArgParser } from "./info";
import { LayoutParser } from "./layout";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser,
    protected readonly layoutParser: LayoutParser
  ) {}

  public async requestAsync(arg: string): Promise<void> {
    const actionInfo = this.argParser.parse(arg);
    this.requester.executeAsync(actionInfo);
    return;
  }

  public async open(arg: string): Promise<void> {
    const bufferOpenInfos = this.argParser.parseBufferOpenArg(arg);
    const layoutItem = this.layoutParser.parse(bufferOpenInfos);
    await layoutItem.openLayout();
  }
}
