import { Neovim } from "neovim";

export class HighlightRepository {
  constructor(protected readonly vim: Neovim) {}

  public async link(from: string, to: string): Promise<void> {
    await this.vim.command(`highlight default link ${from} ${to}`);
  }

  public async match(name: string, pattern: string): Promise<void> {
    await this.vim.command(`syntax match ${name} /${pattern}/`);
  }
}
