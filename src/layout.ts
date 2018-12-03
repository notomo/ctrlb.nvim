import { Empty } from "./buffers/empty";
import { Buffers } from "./buffers";
import { BaseBuffer } from "./buffers/base";
import { CtrlbBufferType } from "./buffers/type";
import { Neovim, Window } from "neovim";
import { Logger, getLogger } from "./logger";
import { Direction } from "./direction";

type Item = LayoutItem | BufferItem;

export class BufferItem {
  constructor(
    protected readonly buffer: BaseBuffer,
    public readonly sizeParcent: number | null,
    public readonly isActive: boolean
  ) {}

  public async open(direction: Direction) {
    return await this.buffer.open(direction);
  }
}

export class LayoutItem {
  protected readonly logger: Logger;
  protected readonly lazyOpenItems: { window: Window; item: LayoutItem }[];
  protected readonly windowAndItems: { window: Window; item: Item }[];
  public readonly isActive = false;
  constructor(
    protected readonly items: ReadonlyArray<Item>,
    protected readonly direction: Direction,
    public readonly sizeParcent: number | null,
    protected readonly vim: Neovim,
    protected readonly emptyBuffer: Empty
  ) {
    this.logger = getLogger("layout");
    this.lazyOpenItems = [];
    this.windowAndItems = [];
  }

  public async openLayout() {
    await this.emptyBuffer.open(Direction.TAB);
    await this.open();
  }

  public async open() {
    if (this.items.length === 0) {
      return;
    }

    let size = 0;
    if (this.direction === Direction.HORIZONTAL) {
      size = await this.vim.window.width;
    } else if (this.direction === Direction.VERTICAL) {
      size = await this.vim.window.height;
    }

    const firstItem = this.items[0];
    await this.openItem(firstItem, Direction.NOTHING, size);
    for (const item of this.items.slice(1)) {
      await this.openItem(item, this.direction, size);
    }

    for (const dict of this.lazyOpenItems) {
      await this.vim.setWindow(dict.window);
      await dict.item.open();
    }
    this.lazyOpenItems.length = 0;

    for (const dict of this.windowAndItems) {
      await this.setWindowSize(dict.item, dict.window, this.direction, size);
      if (dict.item.isActive) {
        await this.vim.setWindow(dict.window);
      }
    }
    this.windowAndItems.length = 0;
  }

  protected async openItem(item: Item, direction: Direction, size: number) {
    if (item instanceof LayoutItem) {
      await this.emptyBuffer.open(direction);
      const window = await this.vim.window;
      this.windowAndItems.push({ window: window, item: item });
      this.lazyOpenItems.push({ window: window, item: item });
      return;
    }

    await item.open(direction);
    const window = await this.vim.window;
    this.windowAndItems.push({ window: window, item: item });
  }

  protected async setWindowSize(
    item: Item,
    window: Window,
    direction: Direction,
    layoutWindowSize: number
  ) {
    if (item.sizeParcent === null) {
      return;
    }

    const size = Math.round(layoutWindowSize * item.sizeParcent * 0.01);
    if (direction === Direction.HORIZONTAL) {
      window.width = await size;
    } else if (direction === Direction.VERTICAL) {
      window.height = await size;
    }
  }
}

export class LayoutParser {
  constructor(
    protected readonly vim: Neovim,
    protected readonly buffers: Buffers
  ) {}

  public parse(json: unknown, sizeParcent: number | null): LayoutItem {
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

    const validLength = json.items.length;
    let sizeParcents: ReadonlyArray<number | null>;
    if (!this.hasSizeParcents(json)) {
      sizeParcents = Array(validLength).fill(null);
    } else {
      sizeParcents = json.sizeParcents;
    }

    if (!this.isSizeParcents(sizeParcents, validLength)) {
      throw new Error(
        "'sizeParcents' must be number[] and length must be " +
          validLength +
          " and summation is 100"
      );
    }

    return this.parseLayoutItem(
      json.items,
      directionValue,
      sizeParcent,
      sizeParcents
    );
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

  protected hasSizeParcents(json: any): json is { sizeParcents: any[] } {
    return Array.isArray(json.sizeParcents);
  }

  protected hasActive(json: any): json is { active: boolean } {
    return typeof json.active === "boolean";
  }

  protected isSizeParcents(
    value: ReadonlyArray<any>,
    length: number
  ): value is (number | null)[] {
    if (value.every((v: any) => v === null)) {
      return true;
    }

    return (
      value.length === length &&
      value.every((v: any) => {
        return !isNaN(Number(v));
      }) &&
      value.reduce((previous, current) => {
        return previous + current;
      }, 0) === 100
    );
  }

  protected parseLayoutItem(
    items: ReadonlyArray<any>,
    direction: Direction,
    sizeParcent: number | null,
    sizeParcents: ReadonlyArray<number | null>
  ): LayoutItem {
    const parsedItems: Item[] = [];

    const itemAndSizes = sizeParcents.map((sizeParcent, i) => {
      return { item: items[i], sizeParcent: sizeParcent };
    });

    for (const itemAndSize of itemAndSizes) {
      const item = itemAndSize.item;
      if (this.hasName(item)) {
        const isActive = this.hasActive(item);
        const buf = this.buffers.get(item.name);
        parsedItems.push(
          new BufferItem(buf, itemAndSize.sizeParcent, isActive)
        );
        continue;
      }
      const layoutItem = this.parse(item, itemAndSize.sizeParcent);
      parsedItems.push(layoutItem);
    }

    return new LayoutItem(
      parsedItems,
      direction,
      sizeParcent,
      this.vim,
      this.buffers.get(CtrlbBufferType.empty)
    );
  }
}
