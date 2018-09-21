import { BaseBuffer } from "./base";
import { Buffer } from "neovim";
import { CtrlbBufferType } from "./type";

export class Ctrl extends BaseBuffer {
  public readonly type = CtrlbBufferType.ctrl;

  protected async setup(buffer: Buffer): Promise<void> {
    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("modifiable", false);
  }
}
