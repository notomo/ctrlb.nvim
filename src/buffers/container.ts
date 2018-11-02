import { Neovim, Buffer } from "neovim";
import { Direction } from "../direction";
import { BufferRepository } from "../repository/buffer";

export class BufferContainer {
  protected buffer: Buffer | null;
  protected readonly fileType: string;
  protected readonly bufferPath: string;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferRepository: BufferRepository,
    type: string
  ) {
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
    await this.bufferRepository.delete(this.buffer.id);
    this.buffer = null;
    return;
  }

  public async openByDirection(direction: Direction): Promise<Buffer> {
    const buffer = await this.get();
    const id = buffer.id;
    switch (direction) {
      case Direction.VERTICAL:
        await this.bufferRepository.verticalOpen(id);
        return buffer;
      case Direction.HORIZONTAL:
        await this.bufferRepository.horizontalOpen(id);
        return buffer;
      case Direction.NOTHING:
        await this.bufferRepository.open(id);
        return buffer;
      case Direction.TAB:
        await this.bufferRepository.tabOpen(id);
        return buffer;
    }
  }
}
