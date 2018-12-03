import { CtrlbBufferType } from "../../buffers/type";

export class BufferType {
  public get(): ReadonlyArray<string> {
    return Object.keys(CtrlbBufferType);
  }
}
