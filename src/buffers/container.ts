import { Neovim, Buffer } from "neovim";

export class BufferContainer {
  protected buffer: Buffer | null;

  constructor(protected readonly vim: Neovim) {
    this.buffer = null;
  }

  public async get(bufferPath: string): Promise<Buffer> {
    if (this._isInitialized(this.buffer)) {
      return this.buffer;
    }
    await this.vim.command("badd " + bufferPath);
    const bufferNumber = await this.vim.call("bufnr", bufferPath);
    const buffers = await this.vim.buffers;
    for (const buf of buffers) {
      if (buf.id === bufferNumber) {
        this.buffer = buf;
        return this.buffer;
      }
    }
    throw new Error("buffer not found: " + bufferNumber);
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

  public async verticalOpen(bufferPath: string): Promise<Buffer> {
    const buffer = await this.get(bufferPath);
    await this.vim.command("rightbelow vsplit #" + buffer.id);
    return buffer;
  }

  public async horizontalOpen(bufferPath: string): Promise<Buffer> {
    const buffer = await this.get(bufferPath);
    await this.vim.command("rightbelow split #" + buffer.id);
    return buffer;
  }

  public async tabOpen(bufferPath: string): Promise<Buffer> {
    const buffer = await this.get(bufferPath);
    await this.vim.command("tabedit #" + buffer.id);
    return buffer;
  }

  public async open(bufferPath: string): Promise<Buffer> {
    const buffer = await this.get(bufferPath);
    await this.vim.command("buffer " + buffer.id);
    return buffer;
  }
}
