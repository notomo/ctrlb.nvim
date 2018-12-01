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
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    set = jest.fn();
    const BufferOptionStoreClass = jest.fn<BufferOptionStore>(() => ({
      set: set,
    }));
    bufferOptionStore = new BufferOptionStoreClass();

    const BufferClass = jest.fn<Buffer>(() => ({
      lines: [],
    }));
    const buffer = new BufferClass();

    get = jest.fn().mockReturnValue(buffer);
    getOptionStore = jest.fn().mockReturnValue(bufferOptionStore);
    const BufferContainerClass = jest.fn<BufferContainer>(() => ({
      get: get,
      getOptionStore: getOptionStore,
    }));
    bufferContainer = new BufferContainerClass();

    const ItemBufferClass = jest.fn<ItemBuffer<Tab>>(() => ({}));
    itemBuffer = new ItemBufferClass();

    const EventRegistererClass = jest.fn<EventRegisterer>(() => ({}));
    eventRegisterer = new EventRegistererClass();

    open = jest.fn();
    const TabRepositoryClass = jest.fn<TabRepository>(() => ({
      open: open,
    }));
    tabRepository = new TabRepositoryClass();

    currentTab = new CurrentTab(
      vim,
      bufferContainer,
      itemBuffer,
      eventRegisterer,
      tabRepository
    );
  });

  it("save does nothing when the buffer is empty", async () => {
    await currentTab.doAction("save", 0, 0);

    expect(open).not.toHaveBeenCalled();
  });

  it("save does nothing when the buffer is empty", async () => {
    const BufferClass = jest.fn<Buffer>(() => ({
      lines: ["title", "url"],
    }));
    const buffer = new BufferClass();

    get = jest.fn().mockReturnValue(buffer);
    getOptionStore = jest.fn().mockReturnValue(bufferOptionStore);
    const BufferContainerClass = jest.fn<BufferContainer>(() => ({
      get: get,
      getOptionStore: getOptionStore,
    }));
    bufferContainer = new BufferContainerClass();

    currentTab = new CurrentTab(
      vim,
      bufferContainer,
      itemBuffer,
      eventRegisterer,
      tabRepository
    );

    await currentTab.doAction("save", 0, 0);

    expect(open).toHaveBeenCalledWith("url");
  });
});

describe("CurrentTabItem", () => {
  let item: CurrentTabItem;
  let tab: Tab;

  beforeEach(() => {
    const TabClass = jest.fn<Tab>(() => ({
      title: "title",
      url: "url",
    }));
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
