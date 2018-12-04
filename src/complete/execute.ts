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
    const actionNames = args.filter(arg => !arg.startsWith("-"));

    if (
      actionNames.length === 0 ||
      (!currentArg.startsWith("-") && currentArg.length !== 0)
    ) {
      return await this.actionSource.get(currentArg);
    }

    const actionName = actionNames[0];
    const params = args
      .filter(arg => {
        return arg.startsWith("-") && arg.includes("=");
      })
      .map(arg => {
        const equalIndex = arg.indexOf("=");
        return arg.slice(0, equalIndex + 1);
      });

    const keys = await this.actionArgKeySource.get(actionName);
    return keys.filter(key => {
      return !params.includes(key);
    });
  }
}
