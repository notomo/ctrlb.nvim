import { Neovim } from "neovim";
import { BufferContainer } from "./container";

interface Item<Model> {
  toString(): string;
  value: Model;
}

export class ListBuffer<Model> {
  protected items: Item<Model>[] = [];

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

  public async prepend(item: Item<Model>) {
    const buffer = await this.bufferContainer.get();

    const optionStore = await this.bufferContainer.getOptionStore();
    await optionStore.set({ modifiable: true });

    await buffer.insert(item.toString(), 0);

    await optionStore.set({ modifiable: false });

    this.items.unshift(item);
    // FIXME: workaround for corrupted display
    await this.vim.command("redraw!");
  }

  public async set(items: Item<Model>[]) {
    const buffer = await this.bufferContainer.get();
    const lines = items.map(item => {
      return item.toString();
    });

    const optionStore = await this.bufferContainer.getOptionStore();
    await optionStore.set({ modifiable: true });

    const currentWindow = await this.vim.window;
    const currentWindowBufferId = await currentWindow.buffer.id;
    const cursor = await currentWindow.cursor;

    await buffer.remove(0, this.items.length, false);
    await buffer.replace(lines, 0);

    await optionStore.set({ modifiable: false });

    this.items = items;

    // FIXME: workaround for corrupted display
    await this.vim.command("redraw!");

    if (buffer.id !== currentWindowBufferId) {
      return;
    }

    const newLength = await buffer.length;
    if (newLength < cursor[0]) {
      await (currentWindow.cursor = [newLength, cursor[1]]);
      return;
    }
    await (currentWindow.cursor = cursor);
  }
}
