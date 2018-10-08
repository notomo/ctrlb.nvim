import { CtrlbBufferType } from "../../buffers/type";

export class BufferType {
  public get(): string[] {
    return Object.keys(CtrlbBufferType);
  }
}
