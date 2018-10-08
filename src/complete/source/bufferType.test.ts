import { CtrlbBufferType } from "../../buffers/type";
import { BufferType } from "./bufferType";

describe("BufferType", () => {
  it("get", () => {
    const bufferType = new BufferType();

    const result = bufferType.get();

    expect(result.length).toEqual(Object.keys(CtrlbBufferType).length);
  });
});
