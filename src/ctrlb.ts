import { Requester } from "./requester";
import { ArgParser } from "./info";
import { LayoutParser } from "./layout";
import { Buffers } from "./buffers";
import { Completer } from "./complete";
import { Direction } from "./direction";

export class Ctrlb {
  constructor(
    protected readonly requester: Requester,
    protected readonly argParser: ArgParser,
    protected readonly layoutParser: LayoutParser,
    protected readonly buffers: Buffers,
    protected readonly completer: Completer
  ) {}

  public async requestAsync(arg: string): Promise<void> {
    const actionInfo = this.argParser.parse(arg);
    this.requester.executeAsync(actionInfo);
    return;
  }

  public async open(bufferType: string): Promise<void> {
    if (!this.argParser.isBufferType(bufferType)) {
      throw new Error("Inavalid bufferType: " + bufferType);
    }
    const buffer = this.buffers.get(bufferType);
    await buffer.open(Direction.TAB);
  }

  public async openLayout(jsonFilePath: string): Promise<void> {
    const layoutInfo = this.argParser.parseJsonFile(jsonFilePath);
    const layoutItem = this.layoutParser.parse(layoutInfo, null);
    await layoutItem.openLayout();
  }

  public async doAction(
    bufferType: string,
    actionName: string,
    firstLine: number,
    lastLine: number
  ): Promise<void> {
    if (!this.argParser.isBufferType(bufferType)) {
      throw new Error("Inavalid bufferType: " + bufferType);
    }
    const buffer = this.buffers.get(bufferType);
    await buffer.doAction(actionName, firstLine, lastLine);
  }

  public async clearAll(): Promise<void> {
    await this.buffers.clearAll();
  }

  public async complete(
    currentArg: string,
    line: string,
    cursorPosition: number
  ): Promise<string[]> {
    return this.completer.complete(currentArg, line, cursorPosition);
  }
}
