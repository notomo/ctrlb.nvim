import { Command } from "./command";
import { Action } from "./source/action";
import { ActionArgKey } from "./source/actionArgKey";

export class Execute extends Command {
  public readonly name = "Ctrlb";

  constructor(
    protected readonly actionSource: Action,
    protected readonly actionArgKeySource: ActionArgKey
  ) {
    super();
  }

  public async findCandidates(
    currentArg: string,
    args: ReadonlyArray<string>
  ): Promise<ReadonlyArray<string>> {
    return await this.actionSource.get(currentArg);
  }
}
