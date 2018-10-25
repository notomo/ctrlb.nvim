import { Neovim, Buffer } from "neovim";
import { ChildProcess } from "child_process";
import { BufferContainer } from "./container";
import { BaseBuffer } from "./base";
import { CtrlbBufferType } from "./type";
import { Direction } from "../direction";
import { EventRepository } from "../repository/event";

describe("BaseBuffer", () => {
  let buffer: Example;
  let buffer2: Example2;
  let isInitialized: jest.Mock;
  let open: jest.Mock;
  let get: jest.Mock;
  let verticalOpen: jest.Mock;
  let horizontalOpen: jest.Mock;
  let tabOpen: jest.Mock;
  let unload: jest.Mock;
  let command: jest.Mock;
  let subscribe: jest.Mock;
  let unsubscribe: jest.Mock;
  let setFileType: jest.Mock;

  beforeEach(() => {
    command = jest.fn();
    const NeovimClass = jest.fn<Neovim>(() => ({
      command: command,
    }));
    const vim = new NeovimClass();

    subscribe = jest.fn();
    unsubscribe = jest.fn();
    const EventRepositoryClass = jest.fn<EventRepository>(() => ({
      subscribe: subscribe,
      unsubscribe: unsubscribe,
    }));
    const eventRepository = new EventRepositoryClass();

    const BufferClass = jest.fn<Buffer>(() => ({}));
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
    unload = jest.fn().mockReturnValue(vimBuffer);
    setFileType = jest.fn();
    const BufferContainerClass = jest.fn<BufferContainer>(() => ({
      isInitialized: isInitialized,
      open: open,
      get: get,
      verticalOpen: verticalOpen,
      horizontalOpen: horizontalOpen,
      tabOpen: tabOpen,
      unload: unload,
      setFileType: setFileType,
    }));
    const bufferContainer = new BufferContainerClass(vim);

    buffer = new Example(vim, bufferContainer, eventRepository);
    buffer2 = new Example2(vim, bufferContainer, eventRepository);
  });

  it("open", async () => {
    await buffer.open(Direction.NOTHING);
    await buffer.open(Direction.NOTHING);
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

  it("unload", async () => {
    await buffer.open(Direction.HORIZONTAL);
    await buffer.unload();

    expect(unload).toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

class Example extends BaseBuffer {
  public readonly type = CtrlbBufferType.empty;

  constructor(
    vim: Neovim,
    bufferContainer: BufferContainer,
    eventRepository: EventRepository
  ) {
    super(vim, bufferContainer, eventRepository);
    this.actions["actionName"] = async (buffer: Buffer) => {};
  }

  protected async setup(buffer: Buffer): Promise<void> {
    await this.subscribe("eventName");

    const kill = jest.fn();
    const ChildProcessClass = jest.fn<ChildProcess>(() => ({
      kill: kill,
      killed: false,
    }));
    const p = new ChildProcessClass();
    this.receivers.push(p);
  }
}

class Example2 extends BaseBuffer {
  public readonly type = CtrlbBufferType.empty;
}
