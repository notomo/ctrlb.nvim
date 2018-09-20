import { Neovim } from "neovim";
import { LayoutParser } from "./layout";
import { getLogger, Logger } from "./logger";

export class BufferOpener {
  protected readonly logger: Logger;
  protected readonly parser: LayoutParser;
  constructor(protected readonly vim: Neovim) {
    this.logger = getLogger("buffer");
    this.parser = new LayoutParser(vim);
  }

  public async open(info: unknown): Promise<void> {
    const layoutItem = this.parser.parse(info);
    await layoutItem.openLayout();
  }
}
