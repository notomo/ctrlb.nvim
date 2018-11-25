import { BaseBuffer } from "./base";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { Neovim } from "neovim";
import { EventRegisterer } from "./event";

export class Empty extends BaseBuffer {
  public static readonly type = CtrlbBufferType.empty;

  protected readonly options = {
    buftype: "nofile",
    buflisted: false,
    swapfile: false,
    modifiable: false,
  };

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRegisterer: EventRegisterer
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["_test"] = async () => {};
  }
}
