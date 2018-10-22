import { Neovim, Buffer } from "neovim";
import { ChildProcess } from "child_process";
import { Direction } from "../direction";
import { Logger, getLogger } from "../logger";
import { BufferContainer } from "./container";
import { CtrlbBufferType } from "./type";
import { EventRepository } from "../repository/event";

export type Actions = { [index: string]: { (buffer: Buffer): Promise<void> } };

export abstract class BaseBuffer {
  abstract readonly type: CtrlbBufferType;
  protected readonly logger: Logger;
  protected readonly actions: Actions = {};
  protected readonly receivers: ChildProcess[] = [];
  protected readonly subscribedEvents: string[] = [];

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRepository: EventRepository
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
    this.receivers
      .filter(p => {
        return !p.killed;
      })
      .map(p => {
        p.kill();
      });
    this.receivers.length = 0;

    Object.keys(this.subscribedEvents).map(eventName => {
      this.eventRepository.unsubscribe(eventName);
    });
    this.subscribedEvents.length = 0;

    await this.bufferContainer.unload();
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
    this.eventRepository.subscribe(eventName);
    this.subscribedEvents.push(eventName);
  }
}
