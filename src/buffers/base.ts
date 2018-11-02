import { Neovim, Buffer } from "neovim";
import { Direction } from "../direction";
import { Logger, getLogger } from "../logger";
import { BufferContainer } from "./container";
import { CtrlbBufferType } from "./type";
import { EventRegisterer } from "./event";

export type Actions = { [index: string]: { (): Promise<void> } };

export abstract class BaseBuffer {
  public static readonly type: CtrlbBufferType = CtrlbBufferType.empty;
  protected readonly logger: Logger;
  protected readonly actions: Actions = {};

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRegisterer: EventRegisterer
  ) {
    this.logger = getLogger("buffer.base");
  }

  public async open(direction: Direction): Promise<void> {
    const isInitialized = await this.bufferContainer.isInitialized();
    const buffer = await this._open(direction);

    await this.adjustBuffer(buffer);

    await this.vim.command("silent doautocmd WinEnter");
    await this.vim.command("silent doautocmd BufWinEnter");

    if (!isInitialized) {
      await this.bufferContainer.setFileType();
      await this.setup(buffer);
    }
  }

  public async unload() {
    await this.eventRegisterer.unsubscribe();
    await this.bufferContainer.unload();
  }

  protected async _open(direction: Direction): Promise<Buffer> {
    switch (direction) {
      case Direction.VERTICAL:
        return await this.bufferContainer.horizontalOpen();
      case Direction.HORIZONTAL:
        return await this.bufferContainer.verticalOpen();
      case Direction.NOTHING:
        return await this.bufferContainer.open();
      case Direction.TAB:
        return await this.bufferContainer.tabOpen();
    }
  }

  protected async setup(buffer: Buffer): Promise<void> {}
  protected async adjustBuffer(buffer: Buffer): Promise<void> {}

  public async doAction(actionName: string): Promise<void> {
    if (!(actionName in this.actions)) {
      throw new Error("Invalid actionName: " + actionName);
    }
    const action = this.actions[actionName];
    await action();
  }

  protected async debug(stringSource: {} | null) {
    const message = JSON.stringify(stringSource).replace(/'/g, "''");
    await this.vim.command(`echomsg '${message}'`);
  }
}
