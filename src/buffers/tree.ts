import { Neovim } from "neovim";
import { BufferContainer } from "./container";

interface Item<Model> {
  toString(): string;
  value: Model;
  id: string;
  isParent: boolean;
}

export class TreeBuffer<Model> {
  protected items: Item<Model>[] = [];

  protected lastNodeId: string | null = null;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer
  ) {}

  public async getCurrent(): Promise<Model | null> {
    const index = (await this.vim.call("line", ".")) - 1;
    if (index in this.items) {
      return this.items[index].value;
    }
    return null;
  }

  public async getParent(): Promise<Model | null> {
    const parentItem = this.items.find(item => {
      return item.isParent;
    });

    if (parentItem === undefined) {
      return null;
    }

    return parentItem.value;
  }

  public async set(items: Item<Model>[], nodeId: string | null) {
    const buffer = await this.bufferContainer.get();
    const lines = items.map(item => {
      return item.toString();
    });
    await buffer.remove(0, this.items.length, false);
    await buffer.replace(lines, 0);
    this.items = items;

    const lastBookmarkIndex = items.findIndex(item => {
      return this.lastNodeId === item.id;
    });
    if (lastBookmarkIndex !== -1) {
      this.vim.window.cursor = [lastBookmarkIndex + 1, 0];
    }
    this.lastNodeId = nodeId;
  }
}
