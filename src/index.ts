import { Plugin, Function, Neovim, NvimPlugin } from "neovim";
import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";

@Plugin({ dev: true })
export default class TestPlugin {
  protected readonly ctrlb: Ctrlb;

  constructor(
    protected readonly nvim: Neovim,
    protected readonly plugin: NvimPlugin
  ) {
    const parser = new ArgParser();
    const requester = new Requester();
    this.ctrlb = new Ctrlb(requester, parser);
  }

  @Function("_ctrlb_execute", { sync: true })
  public executeAsync(args: any[]): void {
    this.ctrlb.requestAsync(args[0]);
  }
}
