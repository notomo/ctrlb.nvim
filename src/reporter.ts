import { Neovim } from "neovim";
import { getLogger, Logger } from "./logger";

export class Reporter {
  protected readonly logger: Logger;

  constructor(protected readonly nvim: Neovim) {
    this.logger = getLogger("repoter");
  }

  public async error(error: unknown) {
    if (!this.isError(error)) {
      return;
    }
    this.logger.error(error);

    const message = error.stack !== undefined ? error.stack : error.message;
    await this.nvim.errWrite(message).catch(e => this.logger.error(e));
  }

  protected isError(e: any): e is Error {
    return typeof e.name === "string" && typeof e.message === "string";
  }
}
