import { Neovim } from "neovim";

export class HighlightRepository {
  constructor(protected readonly vim: Neovim) {}

  public async link(from: string, to: string): Promise<void> {
    await this.vim.command(`highlight default link ${from} ${to}`);
  }

  public async match(
    name: string,
    pattern: string,
    contains: string[] = []
  ): Promise<void> {
    if (contains.length === 0) {
      await this.vim.command(`syntax match ${name} /${pattern}/`);
      return;
    }

    const joinedContains = contains.join(",");
    await this.vim.command(
      `syntax match ${name} /${pattern}/ contains=${joinedContains}`
    );
  }
}
