import { Neovim } from "neovim";
import { Direction } from "../direction";
import { Logger, getLogger } from "../logger";
import { BufferContainer } from "./container";
import { CtrlbBufferType } from "./type";
import { EventRegisterer } from "./event";
import { BufferOptionStore, Options } from "./option";

export type Actions = { [index: string]: { (): Promise<void> } };

export abstract class BaseBuffer {
  public static readonly type: CtrlbBufferType = CtrlbBufferType.empty;
  protected readonly logger: Logger;
  protected readonly actions: Actions = {};
  protected bufferOptionStore: BufferOptionStore | null = null;
  protected readonly options: Options = {};

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRegisterer: EventRegisterer
  ) {
    this.logger = getLogger("buffer.base");
  }

  public async open(direction: Direction): Promise<void> {
    await this.bufferContainer.openByDirection(direction);

    if (this.bufferOptionStore !== null) {
      await this.bufferOptionStore.adjust();
    }

    await this.vim.command("silent doautocmd WinEnter");
    await this.vim.command("silent doautocmd BufWinEnter");

    if (this.bufferOptionStore === null) {
      this.bufferOptionStore = await this.bufferContainer.getOptionStore();
      await this.bufferOptionStore.setFileType(
        "ctrlb-" + this.bufferContainer.type
      );
      await this.bufferOptionStore.set(this.options);
      await this.setup();
    }
  }

  public async unload() {
    await this.eventRegisterer.unsubscribe();
    await this.bufferContainer.unload();
  }

  protected async setup(): Promise<void> {}

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
