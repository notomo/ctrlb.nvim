import { Plugin, Function, Neovim, NvimPlugin } from "neovim";
import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";
import { BufferOpener } from "./buffer";

@Plugin({ dev: true })
export default class TestPlugin {
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
    this.ctrlb.requestAsync(args[0]);
  }

  @Function("_ctrlb_open_test", { sync: true })
  public open(args: any[]): void {
    this.ctrlb.open(args[0]);
  }
}
