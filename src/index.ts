import { Plugin, Function, Neovim, NvimPlugin } from "neovim";
import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";
import { Reporter } from "./reporter";
import { getLogger } from "./logger";
import { LayoutParser } from "./layout";

@Plugin({ dev: false, alwaysInit: false })
export default class CtrlbPlugin {
  protected readonly ctrlb: Ctrlb;
  protected readonly reporter: Reporter;

  constructor(
    protected readonly nvim: Neovim,
    protected readonly plugin: NvimPlugin
  ) {
    const argParser = new ArgParser();
    const requester = new Requester();
    const layoutParser = new LayoutParser(nvim);
    this.ctrlb = new Ctrlb(requester, argParser, layoutParser);

    const logger = getLogger("index");
    this.reporter = new Reporter(nvim, logger);
  }

  @Function("_ctrlb_execute", { sync: true })
  public executeAsync(args: any[]): void {
    this.ctrlb.requestAsync(args[0]).catch(e => this.reporter.error(e));
  }

  @Function("_ctrlb_open", { sync: true })
  public async open(args: any[]): Promise<void> {
    await this.ctrlb.open(args[0]).catch(e => this.reporter.error(e));
  }
}
