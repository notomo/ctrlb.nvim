import { Command } from "./command";
import { BufferType } from "./source/bufferType";

export class Open extends Command {
  public readonly name = "CtrlbOpen";

  constructor(protected readonly bufferTypeSource: BufferType) {
    super();
  }

  public async findCandidates(
    currentArg: string,
    args: ReadonlyArray<string>
  ): Promise<ReadonlyArray<string>> {
    return this.bufferTypeSource.get();
  }
}
