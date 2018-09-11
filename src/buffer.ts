import { Neovim } from "neovim";
import { BufferOpenInfo } from "./info";
import { Ctrl } from "./buffers/ctrl";
import { Direction } from "./info";

interface CtrlbBuffer {
  open(direction: Direction): void;
}

interface Buffers {
  ctrl: CtrlbBuffer;
  [index: string]: CtrlbBuffer;
}

export class BufferOpener {
  protected readonly buffers: Buffers;

  constructor(protected readonly vim: Neovim) {
    this.buffers = {
      ctrl: new Ctrl(vim),
    };
  }

  public async open(infos: BufferOpenInfo[]) {
    // const switchbuf = await this.vim.buffer.getOption("switchbuf");
    await this.vim.buffer.setOption("switchbuf", "");
    await this.vim.command("tabnew");
    for (const info of infos) {
      await this.buffers[info.name].open(info.direction);
      await this.vim.command("wincmd w");
    }
    // if (switchbuf !== undefined) {
    //   this.vim.buffer.setOption("switchbuf", switchbuf);
    // }
  }
}
