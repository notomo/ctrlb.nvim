import { BufferContainer } from "./container";
import { Direction } from "../direction";
import { Neovim } from "neovim";
import { BufferRepository } from "../repository/buffer";

describe("BufferContainer", () => {
  let bufferContainer: BufferContainer;
  let command: jest.Mock;
  let call: jest.Mock;
  let buffers: jest.Mock;

  let bufferRepository: BufferRepository;
  let open: jest.Mock;
  let tabOpen: jest.Mock;
  let verticalOpen: jest.Mock;
  let horizontalOpen: jest.Mock;
  let deleteBuffer: jest.Mock;

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

    open = jest.fn();
    tabOpen = jest.fn();
    verticalOpen = jest.fn();
    horizontalOpen = jest.fn();
    deleteBuffer = jest.fn();
    const BufferRepositoryClass = jest.fn<BufferRepository>(() => ({
      open: open,
      tabOpen: tabOpen,
      verticalOpen: verticalOpen,
      horizontalOpen: horizontalOpen,
      delete: deleteBuffer,
    }));
    bufferRepository = new BufferRepositoryClass();

    bufferContainer = new BufferContainer(vim, bufferRepository, "type");
  });

  it("isInitialized returns false if get is not called", () => {
    const result = bufferContainer.isInitialized();
    expect(result).toBe(false);
  });

  it("get", async () => {
    await bufferContainer.get();

    const result = bufferContainer.isInitialized();
    expect(result).toBe(true);

    await bufferContainer.get();
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

    const bufferContainer = new BufferContainer(vim, bufferRepository, "type");

    expect(bufferContainer.get()).rejects.toThrowError(/buffer not found: 1/);
  });

  it(`open by NOTHING direction"`, async () => {
    await bufferContainer.openByDirection(Direction.NOTHING);
    expect(open).toHaveBeenCalled();
  });

  it(`open by TAB direction"`, async () => {
    await bufferContainer.openByDirection(Direction.TAB);
    expect(tabOpen).toHaveBeenCalled();
  });

  it(`open by VERTICAL direction"`, async () => {
    await bufferContainer.openByDirection(Direction.VERTICAL);
    expect(verticalOpen).toHaveBeenCalled();
  });

  it(`open by HORIZONTAL direction"`, async () => {
    await bufferContainer.openByDirection(Direction.HORIZONTAL);
    expect(horizontalOpen).toHaveBeenCalled();
  });

  it("unload does nothing if buffer is not initialized", async () => {
    await bufferContainer.unload();

    expect(deleteBuffer).not.toHaveBeenCalled();
  });

  it("unload", async () => {
    await bufferContainer.get();
    await bufferContainer.unload();

    expect(deleteBuffer).toHaveBeenCalled();

    const result = bufferContainer.isInitialized();
    expect(result).toBe(false);
  });
});
