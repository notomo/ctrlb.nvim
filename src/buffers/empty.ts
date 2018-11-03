import { BaseBuffer } from "./base";
import { CtrlbBufferType } from "./type";

export class Empty extends BaseBuffer {
  public static readonly type = CtrlbBufferType.empty;

  protected readonly options = {
    buftype: "nofile",
    buflisted: false,
    swapfile: false,
    modifiable: false,
  };
}
