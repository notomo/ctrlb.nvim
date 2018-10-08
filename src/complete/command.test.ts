import { Command } from "./command";

describe("Command", () => {
  it("match", () => {
    const command = new Example();

    expect(command.match("Example")).toBe(true);
    expect(command.match("Other")).toBe(false);
  });
});

class Example extends Command {
  public readonly name = "Example";

  public async findCandidates(
    currentArg: string,
    args: string[]
  ): Promise<string[]> {
    return [];
  }
}
