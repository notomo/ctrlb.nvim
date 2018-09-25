import { BaseBuffer } from "./base";
import { Buffer } from "neovim";
import { CtrlbBufferType } from "./type";

export class Empty extends BaseBuffer {
  public readonly type = CtrlbBufferType.empty;

  protected async setup(buffer: Buffer): Promise<void> {
    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("buflisted", false);
    await buffer.setOption("swapfile", false);
    await buffer.setOption("modifiable", false);
  }

  protected async adjustBuffer(buffer: Buffer): Promise<void> {
    await buffer.setOption("buflisted", false);
  }
}
