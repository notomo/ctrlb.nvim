import { BufferContainer } from "./container";
import { Neovim } from "neovim";

describe("BufferContainer", () => {
  let bufferContainer: BufferContainer;
  let command: jest.Mock;
  let call: jest.Mock;
  let buffers: jest.Mock;
  const bufferNumber = 1;

  beforeEach(() => {
    const BufferClass = jest.fn<Buffer>(() => ({
      id: bufferNumber,
    }));
    const buf = new BufferClass();

    const OtherBufferClass = jest.fn<Buffer>(() => ({
      id: 2,
    }));
    const otherBuf = new OtherBufferClass();

    command = jest.fn();
    call = jest.fn().mockReturnValue(bufferNumber);
    buffers = jest.fn().mockImplementation(async () => {
      return [otherBuf, buf];
    })();
    const NeovimClass = jest.fn<Neovim>(() => ({
      command: command,
      call: call,
      buffers: buffers,
    }));
    const vim = new NeovimClass();

    bufferContainer = new BufferContainer(vim);
  });

  it("isInitialized returns false if get is not called", () => {
    const result = bufferContainer.isInitialized();
    expect(result).toBe(false);
  });

  it("get", async () => {
    await bufferContainer.get("");

    const result = bufferContainer.isInitialized();
    expect(result).toBe(true);

    await bufferContainer.get("");
  });

  it("get throws error if buffer is not found", async () => {
    const command = jest.fn();
    const call = jest.fn().mockReturnValue(bufferNumber);
    const buffers = jest.fn().mockImplementation(async () => {
      return [];
    })();
    const NeovimClass = jest.fn<Neovim>(() => ({
      command: command,
      call: call,
      buffers: buffers,
    }));
    const vim = new NeovimClass();

    const bufferContainer = new BufferContainer(vim);

    expect(bufferContainer.get("")).rejects.toThrowError(/buffer not found: 1/);
  });
});
