import { ListBuffer } from "./list";
import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { TabList, TabListItem } from "./tabList";
import { TabRepository, Tab } from "../repository/tab";
import { EventRegisterer } from "./event";

describe("TabList", () => {
  let vim: Neovim;
  let bufferContainer: BufferContainer;
  let listBuffer: ListBuffer<Tab>;
  let eventRegisterer: EventRegisterer;
  let tabRepository: TabRepository;
  let tabList: TabList;

  let getCurrent: jest.Mock;
  let getRangeModels: jest.Mock;
  let open: jest.Mock;
  let tabOpen: jest.Mock;
  let close: jest.Mock;
  let duplicate: jest.Mock;
  let reload: jest.Mock;
  let zoomUp: jest.Mock;
  let zoomDown: jest.Mock;
  let zoomReset: jest.Mock;
  let activate: jest.Mock;

  let tabId: number;

  beforeEach(() => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    const BufferContainerClass = jest.fn<BufferContainer>(() => ({}));
    bufferContainer = new BufferContainerClass();

    tabId = 1;

    getCurrent = jest.fn().mockReturnValue({ id: tabId });
    getRangeModels = jest.fn().mockReturnValue([{ id: tabId }, {}]);
    const TreeBufferClass = jest.fn<ListBuffer<Tab>>(() => ({
      getCurrent: getCurrent,
      getRangeModels: getRangeModels,
    }));
    listBuffer = new TreeBufferClass();

    const EventRegistererClass = jest.fn<EventRegisterer>(() => ({}));
    eventRegisterer = new EventRegistererClass();

    open = jest.fn();
    tabOpen = jest.fn();
    close = jest.fn();
    duplicate = jest.fn();
    reload = jest.fn();
    zoomUp = jest.fn();
    zoomDown = jest.fn();
    zoomReset = jest.fn();
    activate = jest.fn();
    const TabRepositoryClass = jest.fn<TabRepository>(() => ({
      open: open,
      tabOpen: tabOpen,
      close: close,
      duplicate: duplicate,
      reload: reload,
      zoomUp: zoomUp,
      zoomDown: zoomDown,
      zoomReset: zoomReset,
      activate: activate,
    }));
    tabRepository = new TabRepositoryClass();

    tabList = new TabList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      tabRepository
    );
  });

  it("activate", async () => {
    await tabList.doAction("activate", 0, 0);

    expect(activate).toHaveBeenCalledWith(tabId);
  });

  it("activate does nothing when tab is null", async () => {
    getCurrent = jest.fn().mockReturnValue(null);
    const TreeBufferClass = jest.fn<ListBuffer<Tab>>(() => ({
      getCurrent: getCurrent,
    }));
    listBuffer = new TreeBufferClass();

    tabList = new TabList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      tabRepository
    );

    await tabList.doAction("activate", 0, 0);

    expect(activate).not.toHaveBeenCalledWith(tabId);
  });

  it("activate does nothing when tab does not have id", async () => {
    getCurrent = jest.fn().mockReturnValue({ id: undefined });
    const TreeBufferClass = jest.fn<ListBuffer<Tab>>(() => ({
      getCurrent: getCurrent,
    }));
    listBuffer = new TreeBufferClass();

    tabList = new TabList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      tabRepository
    );

    await tabList.doAction("activate", 0, 0);

    expect(activate).not.toHaveBeenCalledWith(tabId);
  });

  it("close", async () => {
    await tabList.doAction("close", 0, 0);

    expect(close).toHaveBeenCalledWith(tabId);
  });

  it("reload", async () => {
    await tabList.doAction("reload", 0, 0);

    expect(reload).toHaveBeenCalledWith(tabId);
  });

  it("duplicate", async () => {
    await tabList.doAction("duplicate", 0, 0);

    expect(duplicate).toHaveBeenCalledWith(tabId);
  });

  it("zoomUp", async () => {
    await tabList.doAction("zoomUp", 0, 0);

    expect(zoomUp).toHaveBeenCalledWith(tabId);
  });

  it("zoomDown", async () => {
    await tabList.doAction("zoomDown", 0, 0);

    expect(zoomDown).toHaveBeenCalledWith(tabId);
  });

  it("zoomReset", async () => {
    await tabList.doAction("zoomReset", 0, 0);

    expect(zoomReset).toHaveBeenCalledWith(tabId);
  });

  it("close", async () => {
    await tabList.doAction("close", 0, 0);

    expect(close).toHaveBeenCalledWith(tabId);
  });
});

describe("TabListItem", () => {
  let item: TabListItem;
  let Tab: Tab;

  beforeEach(() => {
    const TabClass = jest.fn<Tab>(() => ({
      title: "title",
      url: "url",
    }));
    Tab = new TabClass();

    item = new TabListItem(Tab);
  });

  it("toString", () => {
    expect("title\turl").toEqual(item.toString());
  });

  it("value", () => {
    expect(Tab).toEqual(item.value);
  });
});
