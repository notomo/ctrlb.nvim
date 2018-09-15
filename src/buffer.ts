import { Neovim } from "neovim";
import { LayoutParser } from "./layout";
import { getLogger, Logger } from "./logger";

export class BufferOpener {
  protected readonly logger: Logger;
  constructor(protected readonly vim: Neovim) {
    this.logger = getLogger("buffer");
  }

  public async open(info: unknown): Promise<void> {
    const parser = new LayoutParser(this.vim);
    const layoutItem = parser.parse(info);
    await this.vim.command("tabnew");
    await layoutItem.open();
  }
}
