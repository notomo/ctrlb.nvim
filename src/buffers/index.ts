import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { Ctrl } from "./ctrl";
import { BookmarkTree } from "./bookmarkTree";
import { CurrentTab } from "./currentTab";
import { Empty } from "./empty";
import { HistoryList } from "./historyList";
import { CtrlbBufferType } from "./type";
import { Di } from "../di";

const BT = CtrlbBufferType;
type CtrlbBuffers = {
  [BT.ctrl]: Ctrl;
  [BT.currentTab]: CurrentTab;
  [BT.empty]: Empty;
  [BT.bookmarkTree]: BookmarkTree;
  [BT.historyList]: HistoryList;
} & { [P in CtrlbBufferType]: BaseBuffer };

export class Buffers {
  protected readonly buffers: CtrlbBuffers;

  constructor(protected readonly vim: Neovim) {
    this.buffers = {
      [BT.ctrl]: Di.get("Ctrl", this.vim, false),
      [BT.currentTab]: Di.get("CurrentTab", this.vim, false),
      [BT.empty]: Di.get("Empty", this.vim, false),
      [BT.bookmarkTree]: Di.get("BookmarkTree", this.vim, false),
      [BT.historyList]: Di.get("HistoryList", this.vim, false),
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
    this.buffers[BT.ctrl] = Di.get("Ctrl", this.vim, false);
    this.buffers[BT.currentTab] = Di.get("CurrentTab", this.vim, false);
    this.buffers[BT.empty] = Di.get("Empty", this.vim, false);
    this.buffers[BT.bookmarkTree] = Di.get("BookmarkTree", this.vim, false);
    this.buffers[BT.historyList] = Di.get("HistoryList", this.vim, false);
  }
}
