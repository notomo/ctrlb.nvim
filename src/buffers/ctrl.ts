import { BaseBuffer } from "./base";
import { Buffer } from "neovim";

export class Ctrl extends BaseBuffer {
  public readonly type = "ctrl";

  protected async setup(buffer: Buffer): Promise<void> {
    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("modifiable", false);
  }
}
