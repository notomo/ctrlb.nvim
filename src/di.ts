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
import { ActionGroup } from "./complete/source/actionGroup";
import { Action } from "./complete/source/action";
import { ActionArgKey } from "./complete/source/actionArgKey";
import { ApiInfoRepository } from "./repository/apiInfo";
import { BookmarkRepository } from "./repository/bookmark";
import { TabRepository } from "./repository/tab";
import { EventRepository } from "./repository/event";
import { HistoryRepository } from "./repository/history";
import { Execute } from "./complete/execute";
import { Open } from "./complete/open";
import { BufferContainer } from "./buffers/container";
import { Ctrl } from "./buffers/ctrl";
import { BookmarkTree } from "./buffers/bookmarkTree";
import { CurrentTab } from "./buffers/currentTab";
import { Empty } from "./buffers/empty";
import { HistoryList } from "./buffers/historyList";

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
      return new Requester();
    },
    Reporter: (vim: Neovim) => {
      const logger = getLogger("index");
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
    Open: (vim: Neovim) => {
      const bufferType = new BufferType();
      return new Open(bufferType);
    },
    Execute: (vim: Neovim) => {
      const apiInfoRepository = Di.get("ApiInfoRepository", vim);
      const actionGroup = new ActionGroup(apiInfoRepository);
      const action = new Action(apiInfoRepository);
      const actionArgKey = new ActionArgKey();
      return new Execute(actionGroup, action, actionArgKey);
    },
    Ctrl: (vim: Neovim) => {
      const eventRepository = Di.get("EventRepository", vim);
      return new Ctrl(vim, new BufferContainer(vim), eventRepository);
    },
    BookmarkTree: (vim: Neovim) => {
      const eventRepository = Di.get("EventRepository", vim);
      const bookmarkRepository = Di.get("BookmarkRepository", vim);
      return new BookmarkTree(
        vim,
        new BufferContainer(vim),
        eventRepository,
        bookmarkRepository
      );
    },
    CurrentTab: (vim: Neovim) => {
      const eventRepository = Di.get("EventRepository", vim);
      const tabRepository = Di.get("TabRepository", vim);
      return new CurrentTab(
        vim,
        new BufferContainer(vim),
        eventRepository,
        tabRepository
      );
    },
    Empty: (vim: Neovim) => {
      const eventRepository = Di.get("EventRepository", vim);
      return new Empty(vim, new BufferContainer(vim), eventRepository);
    },
    HistoryList: (vim: Neovim) => {
      const eventRepository = Di.get("EventRepository", vim);
      const historyRepository = Di.get("HistoryRepository", vim);
      const tabRepository = Di.get("TabRepository", vim);
      return new HistoryList(
        vim,
        new BufferContainer(vim),
        eventRepository,
        historyRepository,
        tabRepository
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
    Ctrl: null,
    BookmarkTree: null,
    CurrentTab: null,
    Empty: null,
    HistoryList: null,
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
  public static get(cls: "HistoryRepository", vim: Neovim): HistoryRepository;
  public static get(cls: "EventRepository", vim: Neovim): EventRepository;
  public static get(cls: "TabRepository", vim: Neovim): TabRepository;
  public static get(cls: "BookmarkRepository", vim: Neovim): BookmarkRepository;
  public static get(cls: "ApiInfoRepository", vim: Neovim): ApiInfoRepository;
  public static get(cls: "Execute", vim: Neovim): Execute;
  public static get(cls: "Open", vim: Neovim): Open;
  public static get(cls: "Completer", vim: Neovim): Completer;
  public static get(cls: "Reporter", vim: Neovim): Reporter;
  public static get(cls: "Requester", vim: Neovim): Requester;
  public static get(cls: "Ctrlb", vim: Neovim): Ctrlb;
  public static get(
    cls: keyof Deps,
    vim: Neovim,
    cacheable: boolean = true
  ): ReturnType<Deps[keyof Deps]> {
    const cache = this.cache[cls];
    if (cache !== null) {
      return cache;
    }
    const resolved = this.deps[cls](vim);
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
  Ctrlb: { (vim: Neovim): Ctrlb };
  Requester: { (vim: Neovim): Requester };
  Reporter: { (vim: Neovim): Reporter };
  Open: { (vim: Neovim): Open };
  Execute: { (vim: Neovim): Execute };
  Completer: { (vim: Neovim): Completer };
  ApiInfoRepository: { (vim: Neovim): ApiInfoRepository };
  BookmarkRepository: { (vim: Neovim): BookmarkRepository };
  TabRepository: { (vim: Neovim): TabRepository };
  EventRepository: { (vim: Neovim): EventRepository };
  HistoryRepository: { (vim: Neovim): HistoryRepository };
  Ctrl: { (vim: Neovim): Ctrl };
  BookmarkTree: { (vim: Neovim): BookmarkTree };
  CurrentTab: { (vim: Neovim): CurrentTab };
  Empty: { (vim: Neovim): Empty };
  HistoryList: { (vim: Neovim): HistoryList };
}

type DepsCache = { [P in keyof Deps]: ReturnType<Deps[P]> | null };
