import { Neovim, Buffer } from "neovim";

export type Options = {
  buftype?: string;
  swapfile?: boolean;
  modifiable?: boolean;
  buflisted?: boolean;
};

export class BufferOptionStore {
  protected buflisted: boolean | null = null;

  constructor(
    protected readonly vim: Neovim,
    protected readonly buffer: Buffer
  ) {}

  public async set(options: Options) {
    const promises: (void | Promise<void>)[] = [];
    if (options.buftype !== undefined) {
      promises.push(this.buffer.setOption("buftype", options.buftype));
    }
    if (options.swapfile !== undefined) {
      promises.push(this.buffer.setOption("swapfile", options.swapfile));
    }
    if (options.modifiable !== undefined) {
      promises.push(this.buffer.setOption("modifiable", options.modifiable));
    }
    if (options.buflisted !== undefined) {
      this.buflisted = options.buflisted;
      promises.push(this.buffer.setOption("buflisted", options.buflisted));
    }

    await Promise.all(promises);
  }

  public async setFileType(fileType: string) {
    await this.buffer.setOption("filetype", fileType);
    await this.vim.command("silent doautocmd FileType " + fileType);
  }

  public async adjust() {
    if (this.buflisted !== null) {
      await this.buffer.setOption("buflisted", this.buflisted);
    }
  }
}

export class BufferOptionStoreFactory {
  constructor(protected readonly vim: Neovim) {}

  public create(buffer: Buffer): BufferOptionStore {
    return new BufferOptionStore(this.vim, buffer);
  }
}
