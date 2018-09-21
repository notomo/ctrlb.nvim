import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { Ctrl } from "./ctrl";
import { CurrentTab } from "./current-tab";
import { Nothing } from "./nothing";
import { Requester } from "../requester";
import { CtrlbBufferType } from "./type";

type CtrlbBuffers = {
  [CtrlbBufferType.ctrl]: Ctrl;
  [CtrlbBufferType.currentTab]: CurrentTab;
  [CtrlbBufferType.nothing]: Nothing;
} & { [P in CtrlbBufferType]: BaseBuffer };

export class Buffers {
  protected readonly buffers: CtrlbBuffers;

  constructor(protected readonly vim: Neovim, requester: Requester) {
    this.buffers = {
      [CtrlbBufferType.ctrl]: new Ctrl(vim, requester),
      [CtrlbBufferType.currentTab]: new CurrentTab(vim, requester),
      [CtrlbBufferType.nothing]: new Nothing(vim, requester),
    };
  }

  public get<T extends CtrlbBufferType>(name: T): CtrlbBuffers[T] {
    return this.buffers[name];
  }
}
