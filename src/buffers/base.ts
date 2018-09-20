import { Neovim, Buffer } from "neovim";
import { Direction } from "../layout";
import { Requester } from "../requester";
import { Logger, getLogger } from "../logger";

export abstract class BaseBuffer {
  abstract readonly type: string;
  protected readonly logger: Logger;
  protected readonly requester: Requester;
  protected buffer: Buffer | null;

  constructor(protected readonly vim: Neovim) {
    this.buffer = null;
    this.logger = getLogger("buffer.base");
    this.requester = new Requester();
  }

  protected async create(): Promise<Buffer> {
    if (this.isInitialized(this.buffer)) {
      return this.buffer;
    }
    const bufferName = this.fileType;
    await this.vim.command("badd ctrlb://" + bufferName);
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

  protected isInitialized(buffer: Buffer | null): buffer is Buffer {
    return buffer !== null;
  }

  public async open(direction: Direction): Promise<void> {
    const isInitialized = this.isInitialized(this.buffer);
    const buffer = await this.create();
    switch (direction) {
      case Direction.VERTICAL:
        await this.vim.command("rightbelow split #" + buffer.id);
        break;
      case Direction.HORIZONTAL:
        await this.vim.command("rightbelow vsplit #" + buffer.id);
        break;
      case Direction.NOTHING:
        await this.vim.command("buffer " + buffer.id);
        break;
      case Direction.TAB:
        await this.vim.command("tabedit #" + buffer.id);
        break;
      default:
        this.assertNever(direction);
        break;
    }
    await this.adjustBuffer(buffer);
    await this.vim.command("silent doautocmd WinEnter");
    await this.vim.command("silent doautocmd BufWinEnter");
    if (!isInitialized) {
      const fileType = this.fileType;
      await buffer.setOption("filetype", fileType);
      await this.vim.command("silent doautocmd FileType " + fileType);
      await this.setup(buffer);
    }
  }

  protected async setup(buffer: Buffer): Promise<void> {}
  protected async adjustBuffer(buffer: Buffer): Promise<void> {}

  protected get fileType(): string {
    return "ctrlb-" + this.type;
  }

  protected subscribe(eventName: string) {
    this.requester.executeAsync({
      actionGroupName: "event",
      actionName: "subscribe",
      args: {
        eventName: eventName,
      },
    });
  }

  protected assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
  }
}
