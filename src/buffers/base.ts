import { Neovim, Buffer } from "neovim";
import { Direction } from "../direction";
import { Requester } from "../requester";
import { Logger, getLogger } from "../logger";
import { BufferContainer } from "./container";

export abstract class BaseBuffer {
  abstract readonly type: string;
  protected readonly logger: Logger;
  protected readonly bufferContainer: BufferContainer;

  constructor(
    protected readonly vim: Neovim,
    protected readonly requester: Requester
  ) {
    this.bufferContainer = new BufferContainer(vim);
    this.logger = getLogger("buffer.base");
  }

  public async open(direction: Direction): Promise<void> {
    const isInitialized = await this.bufferContainer.isInitialized();
    const buffer = await this.bufferContainer.get(this.bufferPath);

    switch (direction) {
      case Direction.VERTICAL:
        await this.vim.command("rightbelow split #" + buffer.id);
        break;
      case Direction.HORIZONTAL:
        await this.vim.command("rightbelow vsplit #" + buffer.id);
        break;
      case Direction.NOTHING:
        await this.vim.command("buffer " + buffer.id);
        break;
      case Direction.TAB:
        await this.vim.command("tabedit #" + buffer.id);
        break;
      default:
        this.assertNever(direction);
        break;
    }

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

  protected async setup(buffer: Buffer): Promise<void> {}
  protected async adjustBuffer(buffer: Buffer): Promise<void> {}

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

  protected assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
  }
}
