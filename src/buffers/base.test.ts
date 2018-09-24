import { Neovim, Buffer } from "neovim";
import { Requester } from "../requester";
import { BufferContainer } from "./container";
import { BaseBuffer } from "./base";
import { CtrlbBufferType } from "./type";
import { Direction } from "../direction";

describe("BaseBuffer", () => {
  let buffer: Example;
  let buffer2: Example2;
  let isInitialized: jest.Mock;
  let open: jest.Mock;
  let get: jest.Mock;
  let verticalOpen: jest.Mock;
  let horizontalOpen: jest.Mock;
  let tabOpen: jest.Mock;
  let command: jest.Mock;
  let setOption: jest.Mock;
  let executeAsync: jest.Mock;

  beforeEach(() => {
    command = jest.fn();
    const NeovimClass = jest.fn<Neovim>(() => ({
      command: command,
    }));
    const vim = new NeovimClass();

    executeAsync = jest.fn();
    const RequesterClass = jest.fn<Requester>(() => ({
      executeAsync: executeAsync,
    }));
    const requester = new RequesterClass();

    setOption = jest.fn();
    const BufferClass = jest.fn<Buffer>(() => ({
      setOption: setOption,
    }));
    const vimBuffer = new BufferClass();

    isInitialized = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    open = jest.fn().mockReturnValue(vimBuffer);
    get = jest.fn().mockReturnValue(vimBuffer);
    verticalOpen = jest.fn().mockReturnValue(vimBuffer);
    horizontalOpen = jest.fn().mockReturnValue(vimBuffer);
    tabOpen = jest.fn().mockReturnValue(vimBuffer);
    const BufferContainerClass = jest.fn<BufferContainer>(() => ({
      isInitialized: isInitialized,
      open: open,
      get: get,
      verticalOpen: verticalOpen,
      horizontalOpen: horizontalOpen,
      tabOpen: tabOpen,
    }));
    const bufferContainer = new BufferContainerClass(vim);

    buffer = new Example(vim, requester, bufferContainer);
    buffer2 = new Example2(vim, requester, bufferContainer);
  });

  it("open", async () => {
    await buffer.open(Direction.NOTHING);
    await buffer.open(Direction.NOTHING);
    expect(setOption).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("verticalOpen", async () => {
    await buffer.open(Direction.HORIZONTAL);
    expect(verticalOpen).toHaveBeenCalledTimes(1);
  });

  it("horizontalOpen", async () => {
    await buffer.open(Direction.VERTICAL);
    expect(horizontalOpen).toHaveBeenCalledTimes(1);
  });

  it("tabOpen", async () => {
    await buffer.open(Direction.TAB);
    expect(tabOpen).toHaveBeenCalledTimes(1);
  });

  it("open with base setup", async () => {
    await buffer2.open(Direction.TAB);
  });

  it("doAction", async () => {
    await buffer.doAction("actionName");
  });

  it("doAction throws error if actionName is invalid", () => {
    expect(buffer.doAction("invalidActionName")).rejects.toEqual(
      new Error("Invalid actionName: invalidActionName")
    );
  });
});

class Example extends BaseBuffer {
  public readonly type = CtrlbBufferType.nothing;

  constructor(
    vim: Neovim,
    requester: Requester,
    bufferContainer: BufferContainer
  ) {
    super(vim, requester, bufferContainer);
    this.actions["actionName"] = async (buffer: Buffer) => {};
  }

  protected async setup(buffer: Buffer): Promise<void> {
    await this.subscribe("eventName");
  }
}

class Example2 extends BaseBuffer {
  public readonly type = CtrlbBufferType.nothing;
}
