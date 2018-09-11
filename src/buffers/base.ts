import { Neovim, Buffer } from "neovim";
import { Direction } from "./../info";

export abstract class BaseBuffer {
  abstract readonly type: string;
  protected buffer: Buffer | null;

  constructor(protected readonly vim: Neovim) {
    this.buffer = null;
  }

  protected async create(): Promise<Buffer> {
    if (this.buffer !== null) {
      return this.buffer;
    }
    const bufferName = this.fileType;
    this.vim.command("badd " + bufferName);
    const bufferNumber = await this.vim.call("bufnr", bufferName);
    const buffers = await this.vim.buffers;
    for (const buf of buffers) {
      if (buf.id === bufferNumber) {
        this.buffer = buf;
        return this.buffer;
      }
    }
    throw new Error("buffer not found: " + bufferNumber);
  }

  public async open(direction: Direction): Promise<void> {
    const buffer = await this.create();
    if (direction === Direction.VERTICAL) {
      await this.vim.command("vertical sbuffer " + buffer.id);
    } else if (direction === Direction.NOTHING) {
      await this.vim.command("buffer " + buffer.id);
    } else {
      await this.vim.command("sbuffer " + buffer.id);
    }
  }

  public async echomsg(message: Object): Promise<void> {
    await this.vim.command("echomsg '" + message.toString() + "'");
  }

  protected get fileType(): string {
    return "ctrlb-" + this.type;
  }
}
