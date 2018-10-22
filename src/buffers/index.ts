import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { Ctrl } from "./ctrl";
import { BookmarkTree } from "./bookmarkTree";
import { CurrentTab } from "./currentTab";
import { Empty } from "./empty";
import { HistoryList } from "./historyList";
import { CtrlbBufferType } from "./type";
import { Di } from "../di";

type CtrlbBuffers = {
  [CtrlbBufferType.ctrl]: Ctrl;
  [CtrlbBufferType.currentTab]: CurrentTab;
  [CtrlbBufferType.empty]: Empty;
  [CtrlbBufferType.bookmarkTree]: BookmarkTree;
  [CtrlbBufferType.historyList]: HistoryList;
} & { [P in CtrlbBufferType]: BaseBuffer };

export class Buffers {
  protected readonly buffers: CtrlbBuffers;

  constructor(protected readonly vim: Neovim) {
    this.buffers = {
      [CtrlbBufferType.ctrl]: Di.get("Ctrl", this.vim),
      [CtrlbBufferType.currentTab]: Di.get("CurrentTab", this.vim),
      [CtrlbBufferType.empty]: Di.get("Empty", this.vim),
      [CtrlbBufferType.bookmarkTree]: Di.get("BookmarkTree", this.vim),
      [CtrlbBufferType.historyList]: Di.get("HistoryList", this.vim),
    };
  }

  public get<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return this.buffers[name];
  }

  public async clearAll(): Promise<void> {
    Object.keys(this.buffers).map(async bufferType => {
      const buf = this.get(bufferType as CtrlbBufferType);
      await buf.unload();
    });
    Di.clear("Ctrl");
    Di.clear("CurrentTab");
    Di.clear("Empty");
    Di.clear("BookmarkTree");
    Di.clear("HistoryList");
    this.buffers[CtrlbBufferType.ctrl] = Di.get("Ctrl", this.vim);
    this.buffers[CtrlbBufferType.currentTab] = Di.get("CurrentTab", this.vim);
    this.buffers[CtrlbBufferType.empty] = Di.get("Empty", this.vim);
    this.buffers[CtrlbBufferType.bookmarkTree] = Di.get(
      "BookmarkTree",
      this.vim
    );
    this.buffers[CtrlbBufferType.historyList] = Di.get("HistoryList", this.vim);
  }
}
