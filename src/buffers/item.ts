import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { getLogger, Logger } from "../logger";

interface Item<Model> {
  toStrings(): string[];
  value: Model;
}

export class ItemBuffer<Model> {
  protected item: Item<Model> | null;

  protected readonly logger: Logger;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer
  ) {
    this.item = null;
    this.logger = getLogger("buffers.item");
  }

  public async getCurrent(): Promise<Model | null> {
    if (this.item !== null) {
      return this.item.value;
    }
    return null;
  }

  public async set(item: Item<Model>) {
    this.item = item;

    if (!(await this.bufferContainer.isDisplayed())) {
      return;
    }

    const buffer = await this.bufferContainer.get();
    const lines = item.toStrings();
    await buffer.replace(lines, 0);
  }
}
