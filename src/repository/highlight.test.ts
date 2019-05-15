import { HighlightRepository } from "./highlight";
import { Neovim } from "neovim";

describe("HighlightRepository", () => {
  let command: jest.Mock;

  let highlightRepository: HighlightRepository;

  beforeEach(() => {
    command = jest.fn();
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({
      command: command,
    })) as any;
    const neovim = new NeovimClass();

    highlightRepository = new HighlightRepository(neovim);
  });

  it("link", async () => {
    const from = "from";
    const to = "to";

    await highlightRepository.link(from, to);
    expect(command).toHaveBeenCalledWith(
      `highlight default link ${from} ${to}`
    );
  });

  it("match", async () => {
    const name = "name";
    const pattern = "pattern";

    await highlightRepository.match(name, pattern);
    expect(command).toHaveBeenCalledWith(`syntax match ${name} /${pattern}/`);
  });

  it("match with contains", async () => {
    const name = "name";
    const pattern = "pattern";
    const contains = ["contain1", "contain2"];

    await highlightRepository.match(name, pattern, contains);
    expect(command).toHaveBeenCalledWith(
      `syntax match ${name} /${pattern}/ contains=contain1,contain2`
    );
  });
});
