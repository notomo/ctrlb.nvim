import { Plugin, Function, Neovim, NvimPlugin } from "neovim";
import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";
import { BufferOpener } from "./buffer";
import { getLogger } from "./logger";

@Plugin({ dev: true })
export default class CtrlbPlugin {
  protected readonly ctrlb: Ctrlb;

  constructor(
    protected readonly nvim: Neovim,
    protected readonly plugin: NvimPlugin
  ) {
    const parser = new ArgParser();
    const requester = new Requester();
    const opener = new BufferOpener(nvim);
    this.ctrlb = new Ctrlb(requester, parser, opener);
  }

  @Function("_ctrlb_execute", { sync: true })
  public executeAsync(args: any[]): void {
    this.ctrlb.requestAsync(args[0]).catch(e => this.reportError(e));
  }

  @Function("_ctrlb_open", { sync: true })
  public open(args: any[]): void {
    this.ctrlb.open(args[0]).catch(e => this.reportError(e));
  }

  protected async reportError(error: unknown) {
    if (!this.isError(error)) {
      return;
    }
    const logger = getLogger("index");
    logger.error(error);

    const message = error.stack !== undefined ? error.stack : error.message;
    await this.nvim.errWrite(message).catch(e => logger.error(e));
  }

  protected isError(e: any): e is Error {
    return typeof e.name === "string" && typeof e.message === "string";
  }
}
