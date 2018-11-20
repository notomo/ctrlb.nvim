import { NvimPlugin } from "neovim";
import { Ctrlb } from "./ctrlb";
import { Reporter } from "./reporter";
import { Di } from "./di";

export class CtrlbPlugin {
  protected readonly ctrlb: Ctrlb;
  protected readonly reporter: Reporter;

  constructor(protected readonly plugin: NvimPlugin) {
    const vim = plugin.nvim;
    this.ctrlb = Di.get("Ctrlb", vim);
    this.reporter = Di.get("Reporter", vim, false, "index");

    plugin.setOptions({ dev: false, alwaysInit: false });

    plugin.registerFunction("_ctrlb_execute", [this, this.executeAsync], {
      sync: true,
    });
    plugin.registerFunction("_ctrlb_open", [this, this.open], { sync: true });
    plugin.registerFunction("_ctrlb_open_layout", [this, this.openLayout], {
      sync: true,
    });
    plugin.registerFunction("_ctrlb_do_action", [this, this.doAction], {
      sync: true,
    });
    plugin.registerFunction("_ctrlb_clear_all", [this, this.clearAll], {
      sync: true,
    });

    plugin.registerFunction("_ctrlb_complete", [this, this.complete], {
      sync: true,
    });
  }

  public executeAsync(args: string[]): void {
    this.ctrlb.requestAsync(args[0]).catch(e => this.reporter.error(e));
  }

  public async open(args: string[]): Promise<void> {
    await this.ctrlb.open(args[0]).catch(e => this.reporter.error(e));
  }

  public async openLayout(args: string[]): Promise<void> {
    await this.ctrlb.openLayout(args[0]).catch(e => this.reporter.error(e));
  }

  public async doAction(args: any[]): Promise<void> {
    await this.ctrlb
      .doAction(args[0], args[1], args[2], args[3])
      .catch(e => this.reporter.error(e));
  }

  public async clearAll(): Promise<void> {
    await this.ctrlb.clearAll().catch(e => this.reporter.error(e));
  }

  public async complete(args: any[]): Promise<string[]> {
    return await this.ctrlb.complete(args[0], args[1], args[2]).catch(e => {
      this.reporter.error(e);
      return [];
    });
  }
}

const newPlugin = (plugin: NvimPlugin) => new CtrlbPlugin(plugin);
export default newPlugin;
