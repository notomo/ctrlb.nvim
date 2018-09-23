import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { Ctrl } from "./ctrl";
import { BookmarkTree } from "./bookmarkTree";
import { CurrentTab } from "./current-tab";
import { Nothing } from "./nothing";
import { Requester } from "../requester";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";

type CtrlbBuffers = {
  [CtrlbBufferType.ctrl]: Ctrl;
  [CtrlbBufferType.currentTab]: CurrentTab;
  [CtrlbBufferType.nothing]: Nothing;
  [CtrlbBufferType.bookmarkTree]: BookmarkTree;
} & { [P in CtrlbBufferType]: BaseBuffer };

export class Buffers {
  protected readonly buffers: CtrlbBuffers;

  constructor(protected readonly vim: Neovim, requester: Requester) {
    this.buffers = {
      [CtrlbBufferType.ctrl]: this.create(Ctrl, vim, requester),
      [CtrlbBufferType.currentTab]: this.create(CurrentTab, vim, requester),
      [CtrlbBufferType.nothing]: this.create(Nothing, vim, requester),
      [CtrlbBufferType.bookmarkTree]: this.create(BookmarkTree, vim, requester),
    };
  }

  public get<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return this.buffers[name];
  }

  protected create<T extends BaseBuffer>(
    cls: {
      new (
        vim: Neovim,
        requester: Requester,
        bufferContainer: BufferContainer
      ): T;
    },
    vim: Neovim,
    requester: Requester
  ): T {
    return new cls(vim, requester, new BufferContainer(vim));
  }
}
