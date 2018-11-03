import { Neovim, Buffer } from "neovim";
import { BufferContainer } from "./container";
import { BaseBuffer } from "./base";
import { CtrlbBufferType } from "./type";
import { Direction } from "../direction";
import { EventRegisterer } from "./event";
import { BufferOptionStore } from "./option";

describe("BaseBuffer", () => {
  let buffer: Example;
  let isInitialized: jest.Mock;
  let openByDirection: jest.Mock;
  let get: jest.Mock;
  let unload: jest.Mock;
  let command: jest.Mock;
  let unsubscribe: jest.Mock;

  let getOptionStore: jest.Mock;
  let set: jest.Mock;
  let setFileType: jest.Mock;
  let adjust: jest.Mock;

  beforeEach(() => {
    command = jest.fn();
    const NeovimClass = jest.fn<Neovim>(() => ({
      command: command,
    }));
    const vim = new NeovimClass();

    unsubscribe = jest.fn();
    const EventRegistererClass = jest.fn<EventRegisterer>(() => ({
      unsubscribe: unsubscribe,
    }));
    const eventRegisterer = new EventRegistererClass();

    const BufferClass = jest.fn<Buffer>(() => ({}));
    const vimBuffer = new BufferClass();

    set = jest.fn();
    setFileType = jest.fn();
    adjust = jest.fn();
    const BufferOptionStoreClass = jest.fn<BufferOptionStore>(() => ({
      set: set,
      setFileType: setFileType,
      adjust: adjust,
    }));
    const bufferOptionStore = new BufferOptionStoreClass();

    isInitialized = jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    openByDirection = jest.fn().mockReturnValue(vimBuffer);
    get = jest.fn().mockReturnValue(vimBuffer);
    unload = jest.fn().mockReturnValue(vimBuffer);
    getOptionStore = jest.fn().mockReturnValue(bufferOptionStore);
    const BufferContainerClass = jest.fn<BufferContainer>(() => ({
      isInitialized: isInitialized,
      openByDirection: openByDirection,
      get: get,
      unload: unload,
      getOptionStore: getOptionStore,
    }));
    const bufferContainer = new BufferContainerClass(vim);

    buffer = new Example(vim, bufferContainer, eventRegisterer);
  });

  it("open", async () => {
    await buffer.open(Direction.NOTHING);
    await buffer.open(Direction.NOTHING);
    expect(openByDirection).toHaveBeenCalledTimes(2);
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
    eventRegisterer: EventRegisterer
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["actionName"] = async () => {};
  }
}
