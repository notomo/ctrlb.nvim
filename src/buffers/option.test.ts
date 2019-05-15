import { Neovim, Buffer } from "neovim";
import { BufferOptionStore, BufferOptionStoreFactory } from "./option";

describe("BufferOptionStore", () => {
  let command: jest.Mock;
  let setOption: jest.Mock;
  let bufferOptionStore: BufferOptionStore;

  beforeEach(() => {
    command = jest.fn();
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({
      command: command,
    })) as any;
    const vim = new NeovimClass();

    setOption = jest.fn();
    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      setOption: setOption,
    })) as any;
    const buffer = new BufferClass();

    bufferOptionStore = new BufferOptionStore(vim, buffer);
  });

  it("set", async () => {
    await bufferOptionStore.set({
      buftype: "nofile",
      swapfile: false,
      modifiable: true,
      modified: false,
      buflisted: true,
      undolevels: -1,
    });

    expect(setOption).toHaveBeenCalledWith("buftype", "nofile");
    expect(setOption).toHaveBeenCalledWith("swapfile", false);
    expect(setOption).toHaveBeenCalledWith("modifiable", true);
    expect(setOption).toHaveBeenCalledWith("modified", false);
    expect(setOption).toHaveBeenCalledWith("buflisted", true);
    expect(setOption).toHaveBeenCalledWith("undolevels", -1);
  });

  it("set does nothing", async () => {
    await bufferOptionStore.set({});

    expect(setOption).not.toHaveBeenCalled();
  });

  it("setFileType", async () => {
    const fileType = "ctrlb-type";

    await bufferOptionStore.setFileType(fileType);

    expect(setOption).toHaveBeenCalledWith("filetype", fileType);
  });

  it("adjust does nothing", async () => {
    await bufferOptionStore.adjust();

    expect(setOption).not.toHaveBeenCalled();
  });

  it("adjust", async () => {
    await bufferOptionStore.set({ buflisted: true });
    await bufferOptionStore.adjust();

    expect(setOption).toHaveBeenCalledWith("buflisted", true);
  });
});

describe("BufferOptionStoreFactory", () => {
  it("create", () => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    const vim = new NeovimClass();

    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({})) as any;
    const buffer = new BufferClass();

    const bufferOptionStoreFactory = new BufferOptionStoreFactory(vim);
    const bufferOptionStore = bufferOptionStoreFactory.create(buffer);

    const sameBufferOptionStore = bufferOptionStoreFactory.create(buffer);

    expect(typeof bufferOptionStore.set).toEqual("function");
    expect(bufferOptionStore).toBe(sameBufferOptionStore);
  });
});
