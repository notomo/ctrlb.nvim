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

  public async getModel(lineNumber: number): Promise<Model | null> {
    const index = lineNumber - 1;
    if (index in this.items) {
      return this.items[index].value;
    }
    return null;
  }

  public async getCurrent(): Promise<Model | null> {
    const lineNumber = await this.vim.call("line", ".");
    return this.getModel(lineNumber);
  }

  public async getRangeModels(
    firstLine: number,
    lastLine: number
  ): Promise<Model[]> {
    const models: Model[] = [];
    for (const i of [...Array(lastLine - firstLine + 1).keys()]) {
      const lineNubmer = i + firstLine;
      const model = await this.getModel(lineNubmer);
      if (model !== null) {
        models.push(model);
      }
    }
    return models;
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

    const optionStore = await this.bufferContainer.getOptionStore();
    await optionStore.set({ modifiable: true });

    await buffer.remove(0, this.items.length, false);
    await buffer.replace(lines, 0);

    await optionStore.set({ modifiable: false });

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
