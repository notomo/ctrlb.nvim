import { Command } from "./command";
import { ActionGroup } from "./source/actionGroup";
import { ActionName } from "./source/actionName";
import { ActionArgKey } from "./source/actionArgKey";

export class Execute extends Command {
  public readonly name = "Ctrlb";

  constructor(
    protected readonly actionGroupSource: ActionGroup,
    protected readonly actionNameSource: ActionName,
    protected readonly actionArgKeySource: ActionArgKey
  ) {
    super();
  }

  public findCandidates(currentArg: string, args: string[]): string[] {
    const actionGroups = args.filter(arg => {
      return !arg.startsWith("-");
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

    if (
      actionNames.length === 0 &&
      currentArg.includes(actionGroupName + ":")
    ) {
      return this.actionNameSource.get(actionGroupName);
    }

    const actionName = actionNames[0];
    return this.actionArgKeySource.get(actionGroupName, actionName);
  }
}
