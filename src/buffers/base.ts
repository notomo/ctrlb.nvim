import { Neovim } from "neovim";
import { Direction } from "../direction";
import { Logger, getLogger } from "../logger";
import { BufferContainer } from "./container";
import { CtrlbBufferType } from "./type";
import { EventRegisterer } from "./event";
import { Options } from "./option";

export type Actions = {
  [index: string]: { (firstLine: number, lastLine: number): Promise<void> };
};

export abstract class BaseBuffer {
  public static readonly type: CtrlbBufferType = CtrlbBufferType.empty;
  protected readonly logger: Logger;
  protected readonly actions: Actions = {};
  protected readonly options: Options = {};

  protected initialized: boolean = false;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRegisterer: EventRegisterer
  ) {
    this.logger = getLogger("buffer.base");
  }

  public async open(direction: Direction): Promise<void> {
    await this.bufferContainer.openByDirection(direction);

    if (this.initialized) {
      await (await this.bufferContainer.getOptionStore()).adjust();
    }

    await this.vim.command("silent doautocmd WinEnter");
    await this.vim.command("silent doautocmd BufWinEnter");

    if (!this.initialized) {
      const bufferOptionStore = await this.bufferContainer.getOptionStore();
      await bufferOptionStore.setFileType("ctrlb-" + this.bufferContainer.type);
      await bufferOptionStore.set(this.options);
      await this.setup();
      this.initialized = true;
    }
  }

  public async unload() {
    await this.eventRegisterer.unsubscribe();
    await this.bufferContainer.unload();
  }

  protected async setup(): Promise<void> {}

  public async doAction(
    actionName: string,
    firstLine: number = 1,
    lastLine: number = 1
  ): Promise<void> {
    if (!(actionName in this.actions)) {
      throw new Error("Invalid actionName: " + actionName);
    }
    const action = this.actions[actionName];
    await action(firstLine, lastLine);
  }

  protected async debug(stringSource: {} | null) {
    const message = JSON.stringify(stringSource).replace(/'/g, "''");
    await this.vim.command(`echomsg '${message}'`);
  }
}
