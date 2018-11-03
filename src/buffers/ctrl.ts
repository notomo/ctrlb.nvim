import { BaseBuffer } from "./base";
import { CtrlbBufferType } from "./type";

export class Ctrl extends BaseBuffer {
  public static readonly type = CtrlbBufferType.ctrl;

  protected readonly options = {
    buftype: "nofile",
    swapfile: false,
    modifiable: false,
  };
}
