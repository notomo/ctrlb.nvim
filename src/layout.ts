import { Ctrl } from "./buffers/ctrl";
import { Layout } from "./buffers/layout";
import { Neovim, Window } from "neovim";
import { Logger, getLogger } from "./logger";

export enum Direction {
  VERTICAL = "VERTICAL",
  HORIZONTAL = "HORIZONTAL",
  NOTHING = "NOTHING",
}

interface CtrlbBuffer {
  open(direction: Direction): void;
}

enum CtrlbBufferType {
  ctrl = "ctrl",
}

type CtrlbBuffers = {
  ctrl: Ctrl;
} & { [P in CtrlbBufferType]: CtrlbBuffer };

class Buffers {
  protected readonly buffers: CtrlbBuffers;

  constructor(protected readonly vim: Neovim) {
    this.buffers = {
      ctrl: new Ctrl(vim),
    };
  }

  public get<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return this.buffers[name];
  }
}

type Item = LayoutItem | CtrlbBuffer;

class LayoutItem {
  protected readonly logger: Logger;
  protected readonly lazyOpenItems: { window: Window; item: LayoutItem }[];
  constructor(
    protected readonly items: Item[],
    protected readonly direction: Direction,
    protected readonly vim: Neovim,
    protected readonly emptyBuffer: Layout
  ) {
    this.logger = getLogger("layout");
    this.lazyOpenItems = [];
  }

  public async open() {
    if (this.items.length === 0) {
      return;
    }

    const firstItem = this.items[0];
    await this.openItem(firstItem, Direction.NOTHING);
    for (const item of this.items.slice(1)) {
      await this.openItem(item, this.direction);
    }

    for (const dict of this.lazyOpenItems) {
      await this.vim.setWindow(dict.window);
      await dict.item.open();
    }
    this.lazyOpenItems.length = 0;
  }

  protected async openItem(item: Item, direction: Direction) {
    if (item instanceof LayoutItem) {
      await this.emptyBuffer.open(direction);
      const window = await this.vim.window;
      this.lazyOpenItems.push({ window: window, item: item });
      return;
    }

    return await item.open(direction);
  }
}

export class LayoutParser {
  protected readonly buffers: Buffers;
  protected readonly emptyBuffer: Layout;

  constructor(protected readonly vim: Neovim) {
    this.buffers = new Buffers(vim);
    this.emptyBuffer = new Layout(vim);
  }

  public parse(json: unknown): LayoutItem {
    if (!this.hasItems(json)) {
      throw new Error("'items' must be array, but actual: " + json);
    }
    if (!this.hasDirection(json)) {
      throw new Error("'direction' must be string");
    }
    const directionValue = json.direction.toUpperCase();
    if (!this.isDirection(directionValue)) {
      throw new Error("'direction' must be Direction");
    }
    return this.parseLayoutItem(json.items, directionValue);
  }

  protected hasName(json: any): json is { name: CtrlbBufferType } {
    return typeof json.name === "string" && json.name in CtrlbBufferType;
  }

  protected hasItems(json: any): json is { items: any[] } {
    return Array.isArray(json.items);
  }

  protected hasDirection(json: any): json is { direction: string } {
    return typeof json.direction === "string";
  }

  protected isDirection(value: string): value is Direction {
    return value in Direction;
  }

  protected parseLayoutItem(items: any[], direction: Direction): LayoutItem {
    const parsedItems: Item[] = [];
    for (const item of items) {
      if (this.hasName(item)) {
        const buf = this.buffers.get(item.name);
        parsedItems.push(buf);
        continue;
      }
      const layoutItem = this.parse(item);
      parsedItems.push(layoutItem);
    }
    return new LayoutItem(parsedItems, direction, this.vim, this.emptyBuffer);
  }
}
