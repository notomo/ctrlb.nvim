import { Neovim, Buffer } from "neovim";
import { BufferOptionStore, BufferOptionStoreFactory } from "./option";
import { Direction } from "../direction";
import { BufferRepository } from "../repository/buffer";
import { AutocmdRepository } from "../repository/autocmd";
import { getLogger, Logger } from "../logger";

export class BufferContainer {
  protected buffer: Buffer | null;
  protected readonly bufferPath: string;

  protected readonly logger: Logger;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferRepository: BufferRepository,
    protected readonly autocmdRepository: AutocmdRepository,
    protected readonly bufferOptionStoreFactory: BufferOptionStoreFactory,
    public readonly type: string
  ) {
    this.buffer = null;
    this.bufferPath = "ctrlb://" + type;
    this.logger = getLogger("buffers.container");
  }

  public async get(): Promise<Buffer> {
    if (this.buffer !== null) {
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

  public async unload(): Promise<void> {
    if (this.buffer === null) {
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

  public async getOptionStore(): Promise<BufferOptionStore> {
    const buffer = await this.get();
    return this.bufferOptionStoreFactory.create(buffer);
  }

  public async defineReadAction(actionName: string) {
    const bufferId = (await this.get()).id;
    await this.autocmdRepository.defineToBuffer(
      "BufReadCmd",
      bufferId,
      `call ctrlb#do_action("${this.type}", "${actionName}")`
    );
    await this.autocmdRepository.defineToBuffer(
      "BufEnter",
      bufferId,
      `call ctrlb#do_action("${this.type}", "${actionName}")`
    );
  }

  public async defineWriteAction(actionName: string) {
    const bufferId = (await this.get()).id;
    await this.autocmdRepository.defineToBuffer(
      "BufWriteCmd",
      bufferId,
      `call ctrlb#do_action("${this.type}", "${actionName}")`
    );
  }

  public async defineEnableHighlightAction(actionName: string) {
    const bufferId = (await this.get()).id;
    await this.autocmdRepository.defineToBuffer(
      "BufWinEnter",
      bufferId,
      `call ctrlb#do_action("${this.type}", "${actionName}")`
    );
  }

  public async isDisplayed(): Promise<boolean> {
    const bufferId = (await this.get()).id;
    const bufferIds = (await this.bufferRepository.getBufferIdsOnCurrentTab()).filter(
      (id: number) => id === bufferId
    );

    return bufferIds.length !== 0;
  }
}
