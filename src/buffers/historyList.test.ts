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
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    const BufferContainerClass = jest.fn<BufferContainer>(() => ({}));
    bufferContainer = new BufferContainerClass();

    getCurrent = jest.fn().mockReturnValue(null);
    getRangeModels = jest.fn().mockReturnValue([]);
    const TreeBufferClass = jest.fn<ListBuffer<History>>(() => ({
      getCurrent: getCurrent,
      getRangeModels: getRangeModels,
    }));
    listBuffer = new TreeBufferClass();

    const EventRegistererClass = jest.fn<EventRegisterer>(() => ({}));
    eventRegisterer = new EventRegistererClass();

    open = jest.fn();
    tabOpen = jest.fn();
    const HistoryRepositoryClass = jest.fn<HistoryRepository>(() => ({
      open: open,
      tabOpen: tabOpen,
    }));
    historyRepository = new HistoryRepositoryClass();

    const HighlightRepositoryClass = jest.fn<HighlightRepository>(() => ({}));
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
    const TreeBufferClass = jest.fn<ListBuffer<History>>(() => ({
      getCurrent: getCurrent,
    }));
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
    const TreeBufferClass = jest.fn<ListBuffer<History>>(() => ({
      getCurrent: getCurrent,
    }));
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

    expect(tabOpen).not.toHaveBeenCalled();
  });

  it("tabOpenHistory does nothing when the current item does not have url", async () => {
    const history = {
      title: "title",
    };
    getRangeModels = jest.fn().mockReturnValue([history]);
    const TreeBufferClass = jest.fn<ListBuffer<History>>(() => ({
      getRangeModels: getRangeModels,
    }));
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

    expect(tabOpen).not.toHaveBeenCalled();
  });

  it("tabOpenHistory", async () => {
    const url = "url";
    const history = {
      title: "title",
      url: url,
    };
    getRangeModels = jest.fn().mockReturnValue([history]);
    const TreeBufferClass = jest.fn<ListBuffer<History>>(() => ({
      getRangeModels: getRangeModels,
    }));
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

    expect(tabOpen).toHaveBeenCalledWith(url);
  });
});

describe("HistoryListItem", () => {
  let item: HistoryListItem;
  let history: History;

  beforeEach(() => {
    const HistoryClass = jest.fn<History>(() => ({
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
