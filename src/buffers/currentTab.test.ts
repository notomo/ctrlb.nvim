import { ItemBuffer } from "./item";
import { Neovim, Buffer } from "neovim";
import { BufferContainer } from "./container";
import { CurrentTab, CurrentTabItem } from "./currentTab";
import { TabRepository, Tab } from "../repository/tab";
import { EventRegisterer } from "./event";
import { BufferOptionStore } from "./option";

describe("CurrentTab", () => {
  let vim: Neovim;
  let bufferContainer: BufferContainer;
  let itemBuffer: ItemBuffer<Tab>;
  let eventRegisterer: EventRegisterer;
  let tabRepository: TabRepository;
  let currentTab: CurrentTab;
  let bufferOptionStore: BufferOptionStore;

  let get: jest.Mock;
  let set: jest.Mock;
  let open: jest.Mock;
  let getOptionStore: jest.Mock;

  beforeEach(() => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    vim = new NeovimClass();

    set = jest.fn();
    const BufferOptionStoreClass: jest.Mock<BufferOptionStore> = jest.fn(
      () => ({
        set: set,
      })
    ) as any;
    bufferOptionStore = new BufferOptionStoreClass();

    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      lines: [],
    })) as any;
    const buffer = new BufferClass();

    get = jest.fn().mockReturnValue(buffer);
    getOptionStore = jest.fn().mockReturnValue(bufferOptionStore);
    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(() => ({
      get: get,
      getOptionStore: getOptionStore,
    })) as any;
    bufferContainer = new BufferContainerClass();

    const ItemBufferClass: jest.Mock<ItemBuffer<Tab>> = jest.fn(
      () => ({})
    ) as any;
    itemBuffer = new ItemBufferClass();

    const EventRegistererClass: jest.Mock<EventRegisterer> = jest.fn(
      () => ({})
    ) as any;
    eventRegisterer = new EventRegistererClass();

    open = jest.fn();
    const TabRepositoryClass: jest.Mock<TabRepository> = jest.fn(() => ({
      open: open,
    })) as any;
    tabRepository = new TabRepositoryClass();

    currentTab = new CurrentTab(
      vim,
      bufferContainer,
      itemBuffer,
      eventRegisterer,
      tabRepository
    );
  });

  it("write does nothing when the buffer is empty", async () => {
    await currentTab.doAction("write", 0, 0);

    expect(open).not.toHaveBeenCalled();
  });

  it("write does nothing when the buffer is empty", async () => {
    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      lines: ["title", "url"],
    })) as any;
    const buffer = new BufferClass();

    get = jest.fn().mockReturnValue(buffer);
    getOptionStore = jest.fn().mockReturnValue(bufferOptionStore);
    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(() => ({
      get: get,
      getOptionStore: getOptionStore,
    })) as any;
    bufferContainer = new BufferContainerClass();

    currentTab = new CurrentTab(
      vim,
      bufferContainer,
      itemBuffer,
      eventRegisterer,
      tabRepository
    );

    await currentTab.doAction("write", 0, 0);

    expect(open).toHaveBeenCalledWith("url");
  });
});

describe("CurrentTabItem", () => {
  let item: CurrentTabItem;
  let tab: Tab;

  beforeEach(() => {
    const TabClass: jest.Mock<Tab> = jest.fn(() => ({
      title: "title",
      url: "url",
    })) as any;
    tab = new TabClass();

    item = new CurrentTabItem(tab);
  });

  it("toString", () => {
    expect(["title", "url"]).toEqual(item.toStrings());
  });

  it("value", () => {
    expect(tab).toEqual(item.value);
  });
});
