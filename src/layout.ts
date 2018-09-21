import { Ctrl } from "./buffers/ctrl";
import { CurrentTab } from "./buffers/current-tab";
import { Layout } from "./buffers/layout";
import { Neovim, Window } from "neovim";
import { Logger, getLogger } from "./logger";
import { Requester } from "./requester";
import { Direction } from "./direction";

interface CtrlbBuffer {
  open(direction: Direction): void;
}

enum CtrlbBufferType {
  ctrl = "ctrl",
  currentTab = "currentTab",
}

type CtrlbBuffers = {
  [CtrlbBufferType.ctrl]: Ctrl;
  [CtrlbBufferType.currentTab]: CurrentTab;
} & { [P in CtrlbBufferType]: CtrlbBuffer };

export class Buffers {
  protected readonly buffers: CtrlbBuffers;
  public readonly emptyBuffer: Layout;

  constructor(protected readonly vim: Neovim, requester: Requester) {
    this.buffers = {
      [CtrlbBufferType.ctrl]: new Ctrl(vim, requester),
      [CtrlbBufferType.currentTab]: new CurrentTab(vim, requester),
    };
    this.emptyBuffer = new Layout(vim, requester);
  }

  public get<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return this.buffers[name];
  }
}

type Item = LayoutItem | CtrlbBuffer;

export class LayoutItem {
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
      this.buffers.emptyBuffer
    );
  }
}
