import { NvimPlugin } from "neovim";
import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";
import { Reporter } from "./reporter";
import { getLogger } from "./logger";
import { LayoutParser } from "./layout";
import { Buffers } from "./buffers";

export class CtrlbPlugin {
  protected readonly ctrlb: Ctrlb;
  protected readonly reporter: Reporter;

  constructor(protected readonly plugin: NvimPlugin) {
    const vim = plugin.nvim;

    const argParser = new ArgParser();
    const requester = new Requester();
    const buffers = new Buffers(vim, requester);
    const layoutParser = new LayoutParser(vim, buffers);
    this.ctrlb = new Ctrlb(requester, argParser, layoutParser, buffers);

    const logger = getLogger("index");
    this.reporter = new Reporter(vim, logger);

    plugin.setOptions({ dev: false, alwaysInit: false });

    plugin.registerFunction("_ctrlb_execute", [this, this.executeAsync], {
      sync: true,
    });
    plugin.registerFunction("_ctrlb_open", [this, this.open], { sync: true });
    plugin.registerFunction("_ctrlb_do_action", [this, this.doAction], {
      sync: true,
    });
    plugin.registerFunction("_ctrlb_clear_all", [this, this.clearAll], {
      sync: true,
    });
  }

  public executeAsync(args: any[]): void {
    this.ctrlb.requestAsync(args[0]).catch(e => this.reporter.error(e));
  }

  public async open(args: any[]): Promise<void> {
    await this.ctrlb.open(args[0]).catch(e => this.reporter.error(e));
  }

  public async doAction(args: string[]): Promise<void> {
    await this.ctrlb
      .doAction(args[0], args[1])
      .catch(e => this.reporter.error(e));
  }

  public async clearAll(): Promise<void> {
    await this.ctrlb.clearAll().catch(e => this.reporter.error(e));
  }
}

const newPlugin = (plugin: NvimPlugin) => new CtrlbPlugin(plugin);
export default newPlugin;
