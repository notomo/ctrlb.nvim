import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";
import { LayoutParser } from "./layout";
import { Completer } from "./complete";
import { Buffers } from "./buffers";
import { Neovim } from "neovim";
import { getLogger } from "./logger";
import { Reporter } from "./reporter";
import { BufferType } from "./complete/source/bufferType";
import { Action } from "./complete/source/action";
import { ActionArgKey } from "./complete/source/actionArgKey";
import { ApiInfoRepository } from "./repository/apiInfo";
import { BookmarkRepository, Bookmark } from "./repository/bookmark";
import { TabRepository, Tab } from "./repository/tab";
import { EventRepository } from "./repository/event";
import { HistoryRepository, History } from "./repository/history";
import { DownloadRepository, Download } from "./repository/download";
import { BufferRepository } from "./repository/buffer";
import { AutocmdRepository } from "./repository/autocmd";
import { HighlightRepository } from "./repository/highlight";
import { Execute } from "./complete/execute";
import { Open } from "./complete/open";
import { BufferContainer } from "./buffers/container";
import { ListBuffer } from "./buffers/list";
import { ItemBuffer } from "./buffers/item";
import { TreeBuffer } from "./buffers/tree";
import { BufferOptionStoreFactory } from "./buffers/option";
import { Ctrl } from "./buffers/ctrl";
import { BookmarkTree } from "./buffers/bookmarkTree";
import { CurrentTab } from "./buffers/currentTab";
import { Empty } from "./buffers/empty";
import { HistoryList } from "./buffers/historyList";
import { TabList } from "./buffers/tabList";
import { DownloadList } from "./buffers/downloadList";
import { EventRegisterer } from "./buffers/event";

export class Di {
  protected static readonly deps: Deps = {
    Ctrlb: (vim: Neovim) => {
      const argParser = new ArgParser();
      const requester = Di.get("Requester", vim);
      const buffers = new Buffers(vim);
      const layoutParser = new LayoutParser(vim, buffers);
      const completer = Di.get("Completer", vim);
      return new Ctrlb(requester, argParser, layoutParser, buffers, completer);
    },
    Requester: (vim: Neovim) => {
      const reporter = Di.get("Reporter", vim, false, "requester");
      return new Requester(reporter);
    },
    Reporter: (vim: Neovim, name: string) => {
      const logger = getLogger(name);
      return new Reporter(vim, logger);
    },
    Completer: (vim: Neovim) => {
      const open = Di.get("Open", vim);
      const execute = Di.get("Execute", vim);
      return new Completer(open, execute);
    },
    ApiInfoRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new ApiInfoRepository(requester);
    },
    HistoryRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new HistoryRepository(requester);
    },
    DownloadRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new DownloadRepository(requester);
    },
    TabRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new TabRepository(requester);
    },
    BookmarkRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new BookmarkRepository(requester);
    },
    EventRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new EventRepository(requester);
    },
    BufferRepository: (vim: Neovim) => {
      return new BufferRepository(vim);
    },
    AutocmdRepository: (vim: Neovim) => {
      return new AutocmdRepository(vim);
    },
    HighlightRepository: (vim: Neovim) => {
      return new HighlightRepository(vim);
    },
    Open: (vim: Neovim) => {
      const bufferType = new BufferType();
      return new Open(bufferType);
    },
    Execute: (vim: Neovim) => {
      const apiInfoRepository = Di.get("ApiInfoRepository", vim);
      const action = new Action(apiInfoRepository);
      const actionArgKey = new ActionArgKey();
      return new Execute(action, actionArgKey);
    },
    Ctrl: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const bufferContainer = Di.get("BufferContainer", vim, false, Ctrl.type);
      return new Ctrl(vim, bufferContainer, eventRegisterer);
    },
    BookmarkTree: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const highlightRepository = Di.get("HighlightRepository", vim);
      const bookmarkRepository = Di.get("BookmarkRepository", vim);
      const bufferContainer = Di.get(
        "BufferContainer",
        vim,
        false,
        BookmarkTree.type
      );
      const treeBuffer = new TreeBuffer<Bookmark>(vim, bufferContainer);
      return new BookmarkTree(
        vim,
        bufferContainer,
        treeBuffer,
        eventRegisterer,
        highlightRepository,
        bookmarkRepository
      );
    },
    CurrentTab: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const tabRepository = Di.get("TabRepository", vim);
      const bufferContainer = Di.get(
        "BufferContainer",
        vim,
        false,
        CurrentTab.type
      );
      const itemBuffer = new ItemBuffer<Tab>(vim, bufferContainer);
      return new CurrentTab(
        vim,
        bufferContainer,
        itemBuffer,
        eventRegisterer,
        tabRepository
      );
    },
    Empty: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const bufferContainer = Di.get("BufferContainer", vim, false, Empty.type);
      return new Empty(vim, bufferContainer, eventRegisterer);
    },
    HistoryList: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const highlightRepository = Di.get("HighlightRepository", vim);
      const historyRepository = Di.get("HistoryRepository", vim);
      const tabRepository = Di.get("TabRepository", vim);
      const bufferContainer = Di.get(
        "BufferContainer",
        vim,
        false,
        HistoryList.type
      );
      const listBuffer = new ListBuffer<History>(vim, bufferContainer);
      return new HistoryList(
        vim,
        bufferContainer,
        listBuffer,
        eventRegisterer,
        highlightRepository,
        historyRepository,
        tabRepository
      );
    },
    TabList: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const highlightRepository = Di.get("HighlightRepository", vim);
      const tabRepository = Di.get("TabRepository", vim);
      const bufferContainer = Di.get(
        "BufferContainer",
        vim,
        false,
        TabList.type
      );
      const listBuffer = new ListBuffer<Tab>(vim, bufferContainer);
      return new TabList(
        vim,
        bufferContainer,
        listBuffer,
        eventRegisterer,
        highlightRepository,
        tabRepository
      );
    },
    DownloadList: (vim: Neovim) => {
      const eventRegisterer = Di.get("EventRegisterer", vim, false);
      const downloadRepository = Di.get("DownloadRepository", vim);
      const bufferContainer = Di.get(
        "BufferContainer",
        vim,
        false,
        DownloadList.type
      );
      const listBuffer = new ListBuffer<Download>(vim, bufferContainer);
      return new DownloadList(
        vim,
        bufferContainer,
        listBuffer,
        eventRegisterer,
        downloadRepository
      );
    },
    EventRegisterer: (vim: Neovim) => {
      const eventRepository = Di.get("EventRepository", vim);
      return new EventRegisterer(eventRepository);
    },
    BufferContainer: (vim: Neovim, type: string) => {
      const bufferRepository = Di.get("BufferRepository", vim);
      const autocmdRepository = Di.get("AutocmdRepository", vim);
      const bufferOptionStoreFactory = new BufferOptionStoreFactory(vim);
      return new BufferContainer(
        vim,
        bufferRepository,
        autocmdRepository,
        bufferOptionStoreFactory,
        type
      );
    },
  };

  protected static readonly cache: DepsCache = {
    Ctrlb: null,
    Requester: null,
    Reporter: null,
    Open: null,
    Execute: null,
    Completer: null,
    ApiInfoRepository: null,
    BookmarkRepository: null,
    TabRepository: null,
    EventRepository: null,
    HistoryRepository: null,
    DownloadRepository: null,
    BufferRepository: null,
    AutocmdRepository: null,
    HighlightRepository: null,
    EventRegisterer: null,
    Ctrl: null,
    BookmarkTree: null,
    CurrentTab: null,
    Empty: null,
    HistoryList: null,
    TabList: null,
    DownloadList: null,
    BufferContainer: null,
  };

  public static get(cls: "Ctrl", vim: Neovim, cacheable: false): Ctrl;
  public static get(
    cls: "BookmarkTree",
    vim: Neovim,
    cacheable: false
  ): BookmarkTree;
  public static get(
    cls: "CurrentTab",
    vim: Neovim,
    cacheable: false
  ): CurrentTab;
  public static get(cls: "Empty", vim: Neovim, cacheable: false): Empty;
  public static get(
    cls: "HistoryList",
    vim: Neovim,
    cacheable: false
  ): HistoryList;
  public static get(cls: "TabList", vim: Neovim, cacheable: false): TabList;
  public static get(
    cls: "DownloadList",
    vim: Neovim,
    cacheable: false
  ): DownloadList;
  public static get(
    cls: "EventRegisterer",
    vim: Neovim,
    cacheable: false
  ): EventRegisterer;
  public static get(cls: "BufferRepository", vim: Neovim): BufferRepository;
  public static get(cls: "AutocmdRepository", vim: Neovim): AutocmdRepository;
  public static get(
    cls: "HighlightRepository",
    vim: Neovim
  ): HighlightRepository;
  public static get(cls: "HistoryRepository", vim: Neovim): HistoryRepository;
  public static get(cls: "DownloadRepository", vim: Neovim): DownloadRepository;
  public static get(cls: "EventRepository", vim: Neovim): EventRepository;
  public static get(cls: "TabRepository", vim: Neovim): TabRepository;
  public static get(cls: "BookmarkRepository", vim: Neovim): BookmarkRepository;
  public static get(cls: "ApiInfoRepository", vim: Neovim): ApiInfoRepository;
  public static get(
    cls: "BufferContainer",
    vim: Neovim,
    cacheable: false,
    type: string
  ): BufferContainer;
  public static get(cls: "Execute", vim: Neovim): Execute;
  public static get(cls: "Open", vim: Neovim): Open;
  public static get(cls: "Completer", vim: Neovim): Completer;
  public static get(
    cls: "Reporter",
    vim: Neovim,
    cacheable: false,
    name: string
  ): Reporter;
  public static get(cls: "Requester", vim: Neovim): Requester;
  public static get(cls: "Ctrlb", vim: Neovim): Ctrlb;
  public static get(
    cls: keyof Deps,
    vim: Neovim,
    cacheable: boolean = true,
    ...args: any[]
  ): ReturnType<Deps[keyof Deps]> {
    const cache = this.cache[cls];
    if (cache !== null) {
      return cache;
    }
    const resolved = this.deps[cls](vim, ...args);
    if (cacheable) {
      this.cache[cls] = resolved;
    }
    return resolved;
  }

  public static set(
    cls: keyof Deps,
    value: ReturnType<Deps[keyof Deps]>
  ): void {
    this.cache[cls] = value;
  }

  public static clear(): void {
    for (const key of Object.keys(this.deps)) {
      this.cache[key as keyof DepsCache] = null;
    }
  }
}

interface Deps {
  Ctrlb: { (vim: Neovim, ...args: any[]): Ctrlb };
  Requester: { (vim: Neovim, ...args: any[]): Requester };
  Reporter: { (vim: Neovim, ...args: any[]): Reporter };
  Open: { (vim: Neovim, ...args: any[]): Open };
  Execute: { (vim: Neovim, ...args: any[]): Execute };
  Completer: { (vim: Neovim, ...args: any[]): Completer };
  ApiInfoRepository: { (vim: Neovim, ...args: any[]): ApiInfoRepository };
  BookmarkRepository: { (vim: Neovim, ...args: any[]): BookmarkRepository };
  TabRepository: { (vim: Neovim, ...args: any[]): TabRepository };
  EventRepository: { (vim: Neovim, ...args: any[]): EventRepository };
  HistoryRepository: { (vim: Neovim, ...args: any[]): HistoryRepository };
  DownloadRepository: { (vim: Neovim, ...args: any[]): DownloadRepository };
  BufferRepository: { (vim: Neovim, ...args: any[]): BufferRepository };
  AutocmdRepository: { (vim: Neovim, ...args: any[]): AutocmdRepository };
  HighlightRepository: { (vim: Neovim, ...args: any[]): HighlightRepository };
  EventRegisterer: { (vim: Neovim, ...args: any[]): EventRegisterer };
  Ctrl: { (vim: Neovim, ...args: any[]): Ctrl };
  BookmarkTree: { (vim: Neovim, ...args: any[]): BookmarkTree };
  CurrentTab: { (vim: Neovim, ...args: any[]): CurrentTab };
  Empty: { (vim: Neovim, ...args: any[]): Empty };
  HistoryList: { (vim: Neovim, ...args: any[]): HistoryList };
  TabList: { (vim: Neovim, ...args: any[]): TabList };
  DownloadList: { (vim: Neovim, ...args: any[]): DownloadList };
  BufferContainer: { (vim: Neovim, ...args: any[]): BufferContainer };
}

type DepsCache = { [P in keyof Deps]: ReturnType<Deps[P]> | null };
