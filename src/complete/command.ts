import { Logger, getLogger } from "../logger";

export abstract class Command {
  public abstract readonly name: string;
  protected readonly logger: Logger;

  constructor() {
    this.logger = getLogger("complete.command");
  }

  public match(name: string): boolean {
    return name === this.name;
  }

  public abstract findCandidates(
    currentArg: string,
    args: ReadonlyArray<string>
  ): Promise<ReadonlyArray<string>>;
}
