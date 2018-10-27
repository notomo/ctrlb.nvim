import { Neovim, Buffer } from "neovim";

export class BufferContainer {
  protected buffer: Buffer | null;
  protected readonly fileType: string;
  protected readonly bufferPath: string;

  constructor(protected readonly vim: Neovim, type: string) {
    this.buffer = null;
    this.fileType = "ctrlb-" + type;
    this.bufferPath = "ctrlb://" + type;
  }

  public async get(): Promise<Buffer> {
    if (this._isInitialized(this.buffer)) {
      return this.buffer;
    }
    await this.vim.command("badd " + this.bufferPath);
    const bufferNumber = await this.vim.call("bufnr", this.bufferPath);
    const buffers = await this.vim.buffers;
    for (const buf of buffers) {
      if (buf.id === bufferNumber) {
        this.buffer = buf;
        return this.buffer;
      }
    }
    throw new Error("buffer not found: " + bufferNumber);
  }

  public async setFileType() {
    if (this._isInitialized(this.buffer)) {
      await this.buffer.setOption("filetype", this.fileType);
      await this.vim.command("silent doautocmd FileType " + this.fileType);
    }
  }

  protected _isInitialized(buffer: Buffer | null): buffer is Buffer {
    return buffer !== null;
  }

  public isInitialized(): boolean {
    return this._isInitialized(this.buffer);
  }

  public async unload(): Promise<void> {
    if (!this._isInitialized(this.buffer)) {
      return;
    }
    await this.vim.command("bwipeout " + this.buffer.id);
    this.buffer = null;
    return;
  }

  public async verticalOpen(): Promise<Buffer> {
    const buffer = await this.get();
    await this.vim.command("rightbelow vsplit #" + buffer.id);
    return buffer;
  }

  public async horizontalOpen(): Promise<Buffer> {
    const buffer = await this.get();
    await this.vim.command("rightbelow split #" + buffer.id);
    return buffer;
  }

  public async tabOpen(): Promise<Buffer> {
    const buffer = await this.get();
    await this.vim.command("tabedit #" + buffer.id);
    return buffer;
  }

  public async open(): Promise<Buffer> {
    const buffer = await this.get();
    await this.vim.command("buffer " + buffer.id);
    return buffer;
  }
}
