import { Requester } from "../requester";
import { Command } from "./command";
import { Open } from "./open";
import { BufferType } from "./source/bufferType";
import { Logger, getLogger } from "../logger";

export class Completer {
  protected readonly commands: Command[] = [];
  protected readonly logger: Logger;

  constructor(protected readonly requester: Requester) {
    const bufferTypeSource = new BufferType();
    this.commands = [new Open(bufferTypeSource)];

    this.logger = getLogger("completer");
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
      args: splitted.slice(1),
    };
  }
}
