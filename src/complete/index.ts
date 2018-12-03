import { Command } from "./command";
import { Open } from "./open";
import { Execute } from "./execute";
import { Logger, getLogger } from "../logger";

export class Completer {
  protected readonly commands: ReadonlyArray<Command>;
  protected readonly logger: Logger;

  constructor(openCommand: Open, executeCommand: Execute) {
    this.commands = [openCommand, executeCommand];

    this.logger = getLogger("complete.index");
  }

  public async complete(
    currentArg: string,
    line: string,
    cursorPosition: number
  ): Promise<ReadonlyArray<string>> {
    const parsed = this.parseLine(line);
    for (const command of this.commands) {
      if (command.match(parsed.commandName)) {
        return command.findCandidates(currentArg, parsed.args);
      }
    }

    return [];
  }

  protected parseLine(
    line: string
  ): { commandName: string; args: ReadonlyArray<string> } {
    const splitted = line.split(/(?<!\\)[ ]+/);
    return {
      commandName: splitted[0],
      args: splitted.slice(1).filter(arg => {
        return arg.length !== 0;
      }),
    };
  }
}
