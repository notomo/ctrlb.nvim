import { Command } from "./command";
import { ActionGroup } from "./source/actionGroup";
import { Action } from "./source/action";
import { ActionArgKey } from "./source/actionArgKey";

export class Execute extends Command {
  public readonly name = "Ctrlb";

  constructor(
    protected readonly actionGroupSource: ActionGroup,
    protected readonly actionSource: Action,
    protected readonly actionArgKeySource: ActionArgKey
  ) {
    super();
  }

  public async findCandidates(
    currentArg: string,
    args: string[]
  ): Promise<string[]> {
    const actionGroups = args
      .filter(arg => {
        return !arg.startsWith("-") && arg.includes(":");
      })
      .map(arg => {
        return arg.split(":")[0];
      });

    if (actionGroups.length === 0) {
      return this.actionGroupSource.get();
    }

    const actionGroupName = actionGroups[0];
    const prefix = actionGroupName + ":";
    const prefixLength = prefix.length;

    const actionNames = args
      .filter(arg => {
        return arg.startsWith(prefix) && arg.length > prefixLength;
      })
      .map(arg => {
        return arg.slice(prefixLength);
      });

    if (actionNames.length === 0 || currentArg.includes(prefix)) {
      const actionNames = await this.actionSource.get(actionGroupName);
      return actionNames.map(actionName => {
        return prefix + actionName;
      });
    }

    const actionName = actionNames[0];
    return this.actionArgKeySource.get(actionGroupName, actionName);
  }
}
