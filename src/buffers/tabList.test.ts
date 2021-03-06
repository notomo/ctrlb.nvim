import { ListBuffer } from "./list";
import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { TabList, TabListItem } from "./tabList";
import { TabRepository, Tab } from "../repository/tab";
import { HighlightRepository } from "../repository/highlight";
import { EventRegisterer } from "./event";

describe("TabList", () => {
  let vim: Neovim;
  let bufferContainer: BufferContainer;
  let listBuffer: ListBuffer<Tab>;
  let eventRegisterer: EventRegisterer;
  let highlightRepository: HighlightRepository;
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
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    vim = new NeovimClass();

    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(
      () => ({})
    ) as any;
    bufferContainer = new BufferContainerClass();

    tabId = 1;

    getCurrent = jest.fn().mockReturnValue({ id: tabId });
    getRangeModels = jest.fn().mockReturnValue([{ id: tabId }, {}]);
    const TreeBufferClass: jest.Mock<ListBuffer<Tab>> = jest.fn(() => ({
      getCurrent: getCurrent,
      getRangeModels: getRangeModels,
    })) as any;
    listBuffer = new TreeBufferClass();

    const EventRegistererClass: jest.Mock<EventRegisterer> = jest.fn(
      () => ({})
    ) as any;
    eventRegisterer = new EventRegistererClass();

    const HighlightRepositoryClass: jest.Mock<HighlightRepository> = jest.fn(
      () => ({})
    ) as any;
    highlightRepository = new HighlightRepositoryClass();

    open = jest.fn();
    tabOpen = jest.fn();
    close = jest.fn();
    duplicate = jest.fn();
    reload = jest.fn();
    zoomUp = jest.fn();
    zoomDown = jest.fn();
    zoomReset = jest.fn();
    activate = jest.fn();
    const TabRepositoryClass: jest.Mock<TabRepository> = jest.fn(() => ({
      open: open,
      tabOpen: tabOpen,
      close: close,
      duplicate: duplicate,
      reload: reload,
      zoomUp: zoomUp,
      zoomDown: zoomDown,
      zoomReset: zoomReset,
      activate: activate,
    })) as any;
    tabRepository = new TabRepositoryClass();

    tabList = new TabList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      tabRepository
    );
  });

  it("activate", async () => {
    await tabList.doAction("activate", 0, 0);

    expect(activate).toHaveBeenCalledWith(tabId);
  });

  it("activate does nothing when tab is null", async () => {
    getCurrent = jest.fn().mockReturnValue(null);
    const TreeBufferClass: jest.Mock<ListBuffer<Tab>> = jest.fn(() => ({
      getCurrent: getCurrent,
    })) as any;
    listBuffer = new TreeBufferClass();

    tabList = new TabList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      tabRepository
    );

    await tabList.doAction("activate", 0, 0);

    expect(activate).not.toHaveBeenCalledWith(tabId);
  });

  it("activate does nothing when tab does not have id", async () => {
    getCurrent = jest.fn().mockReturnValue({ id: undefined });
    const TreeBufferClass: jest.Mock<ListBuffer<Tab>> = jest.fn(() => ({
      getCurrent: getCurrent,
    })) as any;
    listBuffer = new TreeBufferClass();

    tabList = new TabList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      tabRepository
    );

    await tabList.doAction("activate", 0, 0);

    expect(activate).not.toHaveBeenCalledWith(tabId);
  });

  it("close", async () => {
    await tabList.doAction("close", 0, 0);

    expect(close).toHaveBeenCalledWith([tabId]);
  });

  it("reload", async () => {
    await tabList.doAction("reload", 0, 0);

    expect(reload).toHaveBeenCalledWith([tabId]);
  });

  it("duplicate", async () => {
    await tabList.doAction("duplicate", 0, 0);

    expect(duplicate).toHaveBeenCalledWith([tabId]);
  });

  it("zoomUp", async () => {
    await tabList.doAction("zoomUp", 0, 0);

    expect(zoomUp).toHaveBeenCalledWith([tabId]);
  });

  it("zoomDown", async () => {
    await tabList.doAction("zoomDown", 0, 0);

    expect(zoomDown).toHaveBeenCalledWith([tabId]);
  });

  it("zoomReset", async () => {
    await tabList.doAction("zoomReset", 0, 0);

    expect(zoomReset).toHaveBeenCalledWith([tabId]);
  });

  it("close", async () => {
    await tabList.doAction("close", 0, 0);

    expect(close).toHaveBeenCalledWith([tabId]);
  });
});

describe("TabListItem", () => {
  let item: TabListItem;
  let Tab: Tab;

  beforeEach(() => {
    const TabClass: jest.Mock<Tab> = jest.fn(() => ({
      title: "title",
      url: "url",
    })) as any;
    Tab = new TabClass();

    item = new TabListItem(Tab);
  });

  it("toString", () => {
    expect(" title\turl").toEqual(item.toString());
  });

  it("toString with an active tab", () => {
    const TabClass: jest.Mock<Tab> = jest.fn(() => ({
      title: "title",
      url: "url",
      active: true,
    }));
    Tab = new TabClass();

    item = new TabListItem(Tab);

    expect("|title\turl").toEqual(item.toString());
  });

  it("value", () => {
    expect(Tab).toEqual(item.value);
  });
});
