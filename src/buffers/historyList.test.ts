import { ListBuffer } from "./list";
import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { HistoryList, HistoryListItem } from "./historyList";
import { HistoryRepository, History } from "../repository/history";
import { HighlightRepository } from "../repository/highlight";
import { EventRegisterer } from "./event";

describe("HistoryList", () => {
  let vim: Neovim;
  let bufferContainer: BufferContainer;
  let listBuffer: ListBuffer<History>;
  let eventRegisterer: EventRegisterer;
  let historyRepository: HistoryRepository;
  let highlightRepository: HighlightRepository;
  let historyList: HistoryList;

  let getCurrent: jest.Mock;
  let getRangeModels: jest.Mock;
  let open: jest.Mock;
  let tabOpen: jest.Mock;

  beforeEach(() => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    vim = new NeovimClass();

    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(
      () => ({})
    ) as any;
    bufferContainer = new BufferContainerClass();

    getCurrent = jest.fn().mockReturnValue(null);
    getRangeModels = jest.fn().mockReturnValue([]);
    const TreeBufferClass: jest.Mock<ListBuffer<History>> = jest.fn(() => ({
      getCurrent: getCurrent,
      getRangeModels: getRangeModels,
    })) as any;
    listBuffer = new TreeBufferClass();

    const EventRegistererClass: jest.Mock<EventRegisterer> = jest.fn(
      () => ({})
    ) as any;
    eventRegisterer = new EventRegistererClass();

    open = jest.fn();
    tabOpen = jest.fn();
    const HistoryRepositoryClass: jest.Mock<HistoryRepository> = jest.fn(
      () => ({
        open: open,
        tabOpen: tabOpen,
      })
    ) as any;
    historyRepository = new HistoryRepositoryClass();

    const HighlightRepositoryClass: jest.Mock<HighlightRepository> = jest.fn(
      () => ({})
    ) as any;
    highlightRepository = new HighlightRepositoryClass();

    historyList = new HistoryList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      historyRepository
    );
  });

  it("openHistory does nothing when the current item is null", async () => {
    await historyList.openHistory();

    expect(open).not.toHaveBeenCalled();
  });

  it("openHistory does nothing when the current item does not have url", async () => {
    const history = {
      title: "title",
    };
    getCurrent = jest.fn().mockReturnValue(history);
    const TreeBufferClass: jest.Mock<ListBuffer<History>> = jest.fn(() => ({
      getCurrent: getCurrent,
    })) as any;
    listBuffer = new TreeBufferClass();

    historyList = new HistoryList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      historyRepository
    );

    await historyList.openHistory();

    expect(open).not.toHaveBeenCalled();
  });

  it("openHistory", async () => {
    const url = "url";
    const history = {
      title: "title",
      url: url,
    };
    getCurrent = jest.fn().mockReturnValue(history);
    const TreeBufferClass: jest.Mock<ListBuffer<History>> = jest.fn(() => ({
      getCurrent: getCurrent,
    })) as any;
    listBuffer = new TreeBufferClass();

    historyList = new HistoryList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      historyRepository
    );

    await historyList.openHistory();

    expect(open).toHaveBeenCalledWith(url);
  });

  it("tabOpenHistory does nothing when the current item is null", async () => {
    await historyList.tabOpenHistory(1, 1);

    expect(tabOpen).toHaveBeenCalledWith([]);
  });

  it("tabOpenHistory does nothing when the current item does not have url", async () => {
    const history = {
      title: "title",
    };
    getRangeModels = jest.fn().mockReturnValue([history]);
    const TreeBufferClass: jest.Mock<ListBuffer<History>> = jest.fn(() => ({
      getRangeModels: getRangeModels,
    })) as any;
    listBuffer = new TreeBufferClass();

    historyList = new HistoryList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      historyRepository
    );

    await historyList.tabOpenHistory(1, 1);

    expect(tabOpen).toHaveBeenCalledWith([]);
  });

  it("tabOpenHistory", async () => {
    const url = "url";
    const history = {
      title: "title",
      url: url,
    };
    getRangeModels = jest.fn().mockReturnValue([history]);
    const TreeBufferClass: jest.Mock<ListBuffer<History>> = jest.fn(() => ({
      getRangeModels: getRangeModels,
    })) as any;
    listBuffer = new TreeBufferClass();

    historyList = new HistoryList(
      vim,
      bufferContainer,
      listBuffer,
      eventRegisterer,
      highlightRepository,
      historyRepository
    );

    await historyList.tabOpenHistory(1, 1);

    expect(tabOpen).toHaveBeenCalledWith([url]);
  });
});

describe("HistoryListItem", () => {
  let item: HistoryListItem;
  let history: History;

  beforeEach(() => {
    const HistoryClass: jest.Mock<History> = jest.fn(() => ({
      title: "title",
      url: "url",
    }));
    history = new HistoryClass();

    item = new HistoryListItem(history);
  });

  it("toString", () => {
    expect("title\turl").toEqual(item.toString());
  });

  it("value", () => {
    expect(history).toEqual(item.value);
  });
});
