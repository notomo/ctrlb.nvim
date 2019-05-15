import { BufferContainer } from "./container";
import { BufferOptionStoreFactory } from "./option";
import { Direction } from "../direction";
import { Neovim } from "neovim";
import { BufferRepository } from "../repository/buffer";
import { AutocmdRepository } from "../repository/autocmd";

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
  let getBufferIdsOnCurrentTab: jest.Mock;

  let autocmdRepository: AutocmdRepository;
  let defineToBuffer: jest.Mock;

  let bufferOptionStoreFactory: BufferOptionStoreFactory;
  let create: jest.Mock;

  const bufferNumber = 1;

  beforeEach(() => {
    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      id: bufferNumber,
    })) as any;
    const buf = new BufferClass();

    const OtherBufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      id: 2,
    })) as any;
    const otherBuf = new OtherBufferClass();

    command = jest.fn();
    call = jest.fn().mockReturnValue(bufferNumber);
    buffers = jest.fn().mockImplementation(async () => {
      return [otherBuf, buf];
    })();
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({
      command: command,
      call: call,
      buffers: buffers,
    })) as any;
    const vim = new NeovimClass();

    open = jest.fn();
    tabOpen = jest.fn();
    verticalOpen = jest.fn();
    horizontalOpen = jest.fn();
    deleteBuffer = jest.fn();
    getBufferIdsOnCurrentTab = jest.fn().mockReturnValue([bufferNumber]);
    const BufferRepositoryClass: jest.Mock<BufferRepository> = jest.fn(() => ({
      open: open,
      tabOpen: tabOpen,
      verticalOpen: verticalOpen,
      horizontalOpen: horizontalOpen,
      delete: deleteBuffer,
      getBufferIdsOnCurrentTab: getBufferIdsOnCurrentTab,
    })) as any;
    bufferRepository = new BufferRepositoryClass();

    defineToBuffer = jest.fn();
    const AutocmdRepositoryClass: jest.Mock<AutocmdRepository> = jest.fn(
      () => ({
        defineToBuffer: defineToBuffer,
      })
    ) as any;
    autocmdRepository = new AutocmdRepositoryClass();

    create = jest.fn();
    const BufferOptionStoreFactoryClass: jest.Mock<
      BufferOptionStoreFactory
    > = jest.fn(() => ({
      create: create,
    })) as any;
    bufferOptionStoreFactory = new BufferOptionStoreFactoryClass();

    bufferContainer = new BufferContainer(
      vim,
      bufferRepository,
      autocmdRepository,
      bufferOptionStoreFactory,
      "type"
    );
  });

  it("get", async () => {
    const buffer = await bufferContainer.get();
    expect(buffer.id).toEqual(bufferNumber);

    const theSameBuffer = await bufferContainer.get();
    expect(theSameBuffer.id).toEqual(buffer.id);
  });

  it("get throws error if buffer is not found", async () => {
    const command = jest.fn();
    const call = jest.fn().mockReturnValue(bufferNumber);
    const buffers = jest.fn().mockImplementation(async () => {
      return [];
    })();
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({
      command: command,
      call: call,
      buffers: buffers,
    })) as any;
    const vim = new NeovimClass();

    const bufferContainer = new BufferContainer(
      vim,
      bufferRepository,
      autocmdRepository,
      bufferOptionStoreFactory,
      "type"
    );

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
  });

  it("getOptionStore", async () => {
    await bufferContainer.getOptionStore();

    expect(create).toHaveBeenCalled();
  });

  it("defineReadAction", async () => {
    await bufferContainer.defineReadAction("read");

    expect(defineToBuffer).toHaveBeenCalledWith(
      "BufReadCmd",
      bufferNumber,
      'call ctrlb#do_action("type", "read")'
    );
  });

  it("defineWriteAction", async () => {
    await bufferContainer.defineWriteAction("write");

    expect(defineToBuffer).toHaveBeenCalledWith(
      "BufWriteCmd",
      bufferNumber,
      'call ctrlb#do_action("type", "write")'
    );
  });

  it("defineEnableHighlightAction", async () => {
    await bufferContainer.defineEnableHighlightAction("highlight");

    expect(defineToBuffer).toHaveBeenCalledWith(
      "BufWinEnter",
      bufferNumber,
      'call ctrlb#do_action("type", "highlight")'
    );
  });

  it("isDisplayed", async () => {
    const result = await bufferContainer.isDisplayed();

    expect(result).toEqual(true);
  });
});
