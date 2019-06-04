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
import { ConfigRepository } from "./repository/config";
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

type Deps = {
  Ctrlb: Ctrlb;
  Requester: Requester;
  Reporter: Reporter;
  Open: Open;
  Execute: Execute;
  Completer: Completer;
  ApiInfoRepository: ApiInfoRepository;
  BookmarkRepository: BookmarkRepository;
  TabRepository: TabRepository;
  EventRepository: EventRepository;
  HistoryRepository: HistoryRepository;
  DownloadRepository: DownloadRepository;
  BufferRepository: BufferRepository;
  AutocmdRepository: AutocmdRepository;
  HighlightRepository: HighlightRepository;
  ConfigRepository: ConfigRepository;
  EventRegisterer: EventRegisterer;
  Ctrl: Ctrl;
  BookmarkTree: BookmarkTree;
  CurrentTab: CurrentTab;
  Empty: Empty;
  HistoryList: HistoryList;
  TabList: TabList;
  DownloadList: DownloadList;
  BufferContainer: BufferContainer;
};

type DepsFuncs = {
  [P in keyof Deps]: { (vim: Neovim, ...args: any[]): Deps[P] }
};
type DepsCache = { [P in keyof Deps]: Deps[P] | null };
const initDepsCache = (depsFuncs: DepsFuncs): DepsCache => {
  const caches = {} as DepsCache;
  Object.keys(depsFuncs).map(key => {
    // FIXME: Expression produces a union type that is too complex to represent.
    caches[key as "Ctrlb"] = null;
  });
  return caches;
};

export class Di {
  protected static readonly deps: DepsFuncs = {
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
      const configRepository = Di.get("ConfigRepository", vim);
      return new Requester(reporter, configRepository);
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
      const tabRepository = Di.get("TabRepository", vim);
      return new HistoryRepository(requester, tabRepository);
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
    ConfigRepository: (vim: Neovim) => {
      return new ConfigRepository(vim);
    },
    Open: (vim: Neovim) => {
      const bufferType = new BufferType();
      return new Open(bufferType);
    },
    Execute: (vim: Neovim) => {
      const apiInfoRepository = Di.get("ApiInfoRepository", vim);
      const action = new Action(apiInfoRepository);
      const actionArgKey = new ActionArgKey(apiInfoRepository);
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
        historyRepository
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

  protected static readonly cache: DepsCache = initDepsCache(Di.deps);

  public static get<ClassName extends keyof Deps>(
    cls: ClassName,
    vim: Neovim,
    cacheable: boolean = true,
    ...args: any[]
  ): Deps[ClassName] {
    const cache = this.cache[cls];
    if (cache !== null) {
      // FIXME: Expression produces a union type that is too complex to represent.
      return cache as any;
    }
    const resolved = this.deps[cls](vim, ...args) as Deps[ClassName];
    if (cacheable) {
      // FIXME: Expression produces a union type that is too complex to represent.
      this.cache[cls] = resolved as any;
    }
    return resolved;
  }

  public static set<ClassName extends keyof Deps>(
    cls: ClassName,
    value: Deps[ClassName]
  ): void {
    // FIXME: Expression produces a union type that is too complex to represent.
    this.cache[cls] = value as any;
  }

  public static clear(): void {
    for (const key of Object.keys(this.deps)) {
      // FIXME: Expression produces a union type that is too complex to represent.
      this.cache[key as "Ctrlb"] = null;
    }
  }
}
