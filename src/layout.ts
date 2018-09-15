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
    protected readonly vim: Neovim
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
  }

  protected async openItem(item: Item, direction: Direction) {
    if (item instanceof LayoutItem) {
      await new Layout(this.vim).open(direction);
      const window = await this.vim.window;
      this.lazyOpenItems.push({ window: window, item: item });
      return;
    }
    return await item.open(direction);
  }
}

interface BufferJson {
  name: CtrlbBufferType;
}

export class LayoutParser {
  protected readonly buffers: Buffers;

  constructor(protected readonly vim: Neovim) {
    this.buffers = new Buffers(vim);
  }

  public parse(json: unknown): LayoutItem {
    if (!this.hasItems(json)) {
      throw new Error("");
    }
    if (!this.hasDirection(json)) {
      throw new Error("");
    }
    const directionValue = this.toDirectionTransform(json.direction);
    if (!this.isDirection(directionValue)) {
      throw new Error("");
    }
    return this.parseLayoutItem(json.items, directionValue);
  }

  protected isBufferJson(json: any): json is BufferJson {
    return typeof json.name === "string" && json.name in CtrlbBufferType;
  }

  protected hasItems(json: any): json is { items: any[] } {
    return Array.isArray(json.items);
  }

  protected hasDirection(json: any): json is { direction: string } {
    return typeof json.direction === "string";
  }

  protected toDirectionTransform(value: string): string {
    return value.toUpperCase();
  }

  protected isDirection(value: string): value is Direction {
    return value in Direction;
  }

  protected parseLayoutItem(items: any[], direction: Direction): LayoutItem {
    const parsedItems: Item[] = [];
    for (const item of items) {
      if (this.isBufferJson(item)) {
        const buf = this.buffers.get(item.name);
        parsedItems.push(buf);
        continue;
      }
      const layoutItem = this.parse(item);
      parsedItems.push(layoutItem);
    }
    return new LayoutItem(parsedItems, direction, this.vim);
  }
}
