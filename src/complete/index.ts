import { Requester } from "../requester";
import { Command } from "./command";
import { Open } from "./open";
import { Execute } from "./execute";
import { BufferType } from "./source/bufferType";
import { ActionGroup } from "./source/actionGroup";
import { ActionName } from "./source/actionName";
import { ActionArgKey } from "./source/actionArgKey";
import { Logger, getLogger } from "../logger";
import { ApiInfoRepository } from "../repository/apiInfo";

export class Completer {
  protected readonly commands: Command[] = [];
  protected readonly logger: Logger;

  constructor(protected readonly requester: Requester) {
    const bufferTypeSource = new BufferType();

    const apiInfoRepository = new ApiInfoRepository(requester);
    const actionGroup = new ActionGroup(apiInfoRepository);
    const actionName = new ActionName(apiInfoRepository);
    const actionArgKey = new ActionArgKey();
    this.commands = [
      new Open(bufferTypeSource),
      new Execute(actionGroup, actionName, actionArgKey),
    ];

    this.logger = getLogger("complete.index");
  }

  public async complete(
    currentArg: string,
    line: string,
    cursorPosition: number
  ): Promise<string[]> {
    const parsed = this.parseLine(line);
    for (const command of this.commands) {
      if (command.match(parsed.commandName)) {
        return command.findCandidates(currentArg, parsed.args);
      }
    }

    return [];
  }

  protected parseLine(line: string): { commandName: string; args: string[] } {
    const splitted = line.split(/(?<!\\)[ ]+/);
    return {
      commandName: splitted[0],
      args: splitted.slice(1).filter(arg => {
        return arg.length !== 0;
      }),
    };
  }
}
