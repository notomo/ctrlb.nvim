export abstract class Command {
  public abstract readonly name: string;

  public match(name: string): boolean {
    return name === this.name;
  }

  public abstract findCandidates(currentArg: string, args: string[]): string[];
}
