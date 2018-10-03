import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { Ctrl } from "./ctrl";
import { BookmarkTree } from "./bookmarkTree";
import { CurrentTab } from "./currentTab";
import { Empty } from "./empty";
import { HistoryList } from "./historyList";
import { Requester } from "../requester";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";

type CtrlbBuffers = {
  [CtrlbBufferType.ctrl]: Ctrl;
  [CtrlbBufferType.currentTab]: CurrentTab;
  [CtrlbBufferType.empty]: Empty;
  [CtrlbBufferType.bookmarkTree]: BookmarkTree;
  [CtrlbBufferType.historyList]: HistoryList;
} & { [P in CtrlbBufferType]: BaseBuffer };

export class Buffers {
  protected readonly buffers: CtrlbBuffers;

  protected readonly mapper = {
    [CtrlbBufferType.ctrl]: Ctrl,
    [CtrlbBufferType.currentTab]: CurrentTab,
    [CtrlbBufferType.empty]: Empty,
    [CtrlbBufferType.bookmarkTree]: BookmarkTree,
    [CtrlbBufferType.historyList]: HistoryList,
  };

  constructor(
    protected readonly vim: Neovim,
    protected readonly requester: Requester
  ) {
    this.buffers = {
      [CtrlbBufferType.ctrl]: this.create(CtrlbBufferType.ctrl),
      [CtrlbBufferType.currentTab]: this.create(CtrlbBufferType.currentTab),
      [CtrlbBufferType.empty]: this.create(CtrlbBufferType.empty),
      [CtrlbBufferType.bookmarkTree]: this.create(CtrlbBufferType.bookmarkTree),
      [CtrlbBufferType.historyList]: this.create(CtrlbBufferType.historyList),
    };
  }

  public get<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return this.buffers[name];
  }

  public async clear<T extends CtrlbBufferType>(name: T): Promise<void> {
    await this.buffers[name].unload();
    this.buffers[name] = this.create(name);
  }

  public async clearAll(): Promise<void> {
    Object.keys(this.mapper).map(bufferType => {
      this.clear(bufferType as CtrlbBufferType);
    });
  }

  protected create<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return new this.mapper[name](
      this.vim,
      this.requester,
      new BufferContainer(this.vim)
    );
  }
}
