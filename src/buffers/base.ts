import { Neovim, Buffer } from "neovim";
import { Direction } from "../direction";
import { Requester } from "../requester";
import { Logger, getLogger } from "../logger";
import { BufferContainer } from "./container";
import { CtrlbBufferType } from "./type";

export type Actions = { [index: string]: { (buffer: Buffer): Promise<void> } };

export abstract class BaseBuffer {
  abstract readonly type: CtrlbBufferType;
  protected readonly logger: Logger;
  protected readonly actions: Actions = {};

  constructor(
    protected readonly vim: Neovim,
    protected readonly requester: Requester,
    protected readonly bufferContainer: BufferContainer
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
      const fileType = this.fileType;
      await buffer.setOption("filetype", fileType);
      await this.vim.command("silent doautocmd FileType " + fileType);
      await this.setup(buffer);
    }
  }

  public async unload() {
    await this.bufferContainer.unload();
    // TODO: stop event receive
  }

  protected async _open(direction: Direction): Promise<Buffer> {
    switch (direction) {
      case Direction.VERTICAL:
        return await this.bufferContainer.horizontalOpen(this.bufferPath);
      case Direction.HORIZONTAL:
        return await this.bufferContainer.verticalOpen(this.bufferPath);
      case Direction.NOTHING:
        return await this.bufferContainer.open(this.bufferPath);
      case Direction.TAB:
        return await this.bufferContainer.tabOpen(this.bufferPath);
    }
  }

  protected async setup(buffer: Buffer): Promise<void> {}
  protected async adjustBuffer(buffer: Buffer): Promise<void> {}

  public async doAction(actionName: string): Promise<void> {
    if (!(actionName in this.actions)) {
      throw new Error("Invalid actionName: " + actionName);
    }
    const action = this.actions[actionName];
    const buffer = await this.bufferContainer.get(this.bufferPath);
    await action(buffer);
  }

  protected get fileType(): string {
    return "ctrlb-" + this.type;
  }

  protected get bufferPath(): string {
    return "ctrlb://" + this.fileType;
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
}
