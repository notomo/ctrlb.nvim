import { Nothing } from "./buffers/nothing";
import { Buffers } from "./buffers";
import { BaseBuffer } from "./buffers/base";
import { CtrlbBufferType } from "./buffers/type";
import { Neovim, Window } from "neovim";
import { Logger, getLogger } from "./logger";
import { Direction } from "./direction";

type Item = LayoutItem | BaseBuffer;

export class LayoutItem {
  protected readonly logger: Logger;
  protected readonly lazyOpenItems: { window: Window; item: LayoutItem }[];
  constructor(
    protected readonly items: Item[],
    protected readonly direction: Direction,
    protected readonly vim: Neovim,
    protected readonly emptyBuffer: Nothing
  ) {
    this.logger = getLogger("layout");
    this.lazyOpenItems = [];
  }

  public async openLayout() {
    await this.emptyBuffer.open(Direction.TAB);
    await this.open();
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
  constructor(
    protected readonly vim: Neovim,
    protected readonly buffers: Buffers
  ) {}

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
    return new LayoutItem(
      parsedItems,
      direction,
      this.vim,
      this.buffers.get(CtrlbBufferType.nothing)
    );
  }
}
