import { Neovim } from "neovim";
import { BufferContainer } from "./container";

interface Item<Model> {
  toStrings(): string[];
  toValue(): Model;
}

export class ItemBuffer<Model> {
  protected item: Item<Model> | null;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer
  ) {
    this.item = null;
  }

  public async getCurrent(): Promise<Model | null> {
    if (this.item !== null) {
      return this.item.toValue();
    }
    return null;
  }

  public async set(item: Item<Model>) {
    const buffer = await this.bufferContainer.get();
    const lines = item.toStrings();
    await buffer.replace(lines, 0);
    this.item = item;
  }
}
