import { AutocmdRepository } from "./autocmd";
import { Neovim } from "neovim";

describe("AutocmdRepository", () => {
  let command: jest.Mock;

  let autocmdRepository: AutocmdRepository;

  beforeEach(() => {
    command = jest.fn();
    const NeovimClass = jest.fn<Neovim>(() => ({
      command: command,
    }));
    const neovim = new NeovimClass();

    autocmdRepository = new AutocmdRepository(neovim);
  });

  it("defineToBuffer", async () => {
    const eventName = "eventName";
    const bufferId = 1;
    const cmd = "cmd";

    await autocmdRepository.defineToBuffer(eventName, bufferId, cmd);
    expect(command).toHaveBeenCalledWith(
      `autocmd ${eventName} <buffer=${bufferId}> ${cmd}`
    );
  });
});
