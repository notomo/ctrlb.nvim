import { Neovim } from "neovim";

export class AutocmdRepository {
  constructor(protected readonly vim: Neovim) {}

  public async define(
    eventName: string,
    pattern: string,
    command: string
  ): Promise<void> {
    await this.vim.command(`autocmd ${eventName} ${pattern} ${command}`);
  }

  public async defineToBuffer(
    eventName: string,
    bufferId: number,
    command: string
  ): Promise<void> {
    await this.define(eventName, `<buffer=${bufferId}>`, command);
  }
}
