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

  public getCurrentNodeId(): string | null {
    return this.lastNodeId;
  }

  public async getRangeModels(
    firstLine: number,
    lastLine: number
  ): Promise<ReadonlyArray<Model>> {
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
    const oldItemLength = this.items.length;
    this.items = items;

    const lastBookmarkIndex = items.findIndex(item => {
      return this.lastNodeId === item.id;
    });
    this.lastNodeId = nodeId;

    if (!(await this.bufferContainer.isDisplayed())) {
      return;
    }

    const buffer = await this.bufferContainer.get();
    const lines = items.map(item => {
      return item.toString();
    });

    const optionStore = await this.bufferContainer.getOptionStore();
    await optionStore.set({ modifiable: true });

    const currentWindow = await this.vim.window;
    const cursor = await currentWindow.cursor;

    await buffer.remove(0, oldItemLength - 1, false);
    await buffer.replace(lines, 0);

    await optionStore.set({ modifiable: false });

    if (lastBookmarkIndex !== -1) {
      await (currentWindow.cursor = [lastBookmarkIndex + 1, 0]);
    } else {
      const newLength = await buffer.length;
      if (newLength < cursor[0]) {
        await (currentWindow.cursor = [newLength, cursor[1]]);
        return;
      }
      await (currentWindow.cursor = cursor);
    }
  }
}
