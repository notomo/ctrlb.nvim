import { Requester } from "./requester";
import { ArgParser } from "./info";
import { LayoutParser } from "./layout";
import { Buffers } from "./buffers";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser,
    protected readonly layoutParser: LayoutParser,
    protected readonly buffers: Buffers
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

  public async doAction(bufferType: string, actionName: string): Promise<void> {
    if (!this.argParser.isBufferType(bufferType)) {
      throw new Error("Inavalid bufferType: " + bufferType);
    }
    const buffer = this.buffers.get(bufferType);
    await buffer.doAction(actionName);
  }
}
