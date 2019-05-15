import { BookmarkTree, BookmarkTreeItem } from "./bookmarkTree";
import { TreeBuffer } from "./tree";
import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { EventRegisterer } from "./event";
import { HighlightRepository } from "../repository/highlight";
import { BookmarkRepository, Bookmark } from "../repository/bookmark";

describe("BookmarkTree", () => {
  let vim: Neovim;
  let bufferContainer: BufferContainer;
  let treeBuffer: TreeBuffer<Bookmark>;
  let eventRegisterer: EventRegisterer;
  let highlightRepository: HighlightRepository;
  let bookmarkRepository: BookmarkRepository;
  let bookmarkTree: BookmarkTree;

  let getCurrent: jest.Mock;
  let getRangeModels: jest.Mock;
  let getParent: jest.Mock;
  let tabOpen: jest.Mock;
  let open: jest.Mock;
  let getTree: jest.Mock;
  let set: jest.Mock;
  let getCurrentNodeId: jest.Mock;
  let remove: jest.Mock;

  let bookmark: Bookmark;
  let id: string;
  let bookmarkDirectory: Bookmark;

  beforeEach(() => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    vim = new NeovimClass();

    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(
      () => ({})
    ) as any;
    bufferContainer = new BufferContainerClass();

    getCurrent = jest.fn().mockReturnValue(null);
    getRangeModels = jest.fn().mockReturnValue([]);
    getParent = jest.fn().mockReturnValue(null);
    set = jest.fn();
    getCurrentNodeId = jest.fn().mockReturnValue(null);
    const TreeBufferClass: jest.Mock<TreeBuffer<Bookmark>> = jest.fn(() => ({
      getCurrent: getCurrent,
      getRangeModels: getRangeModels,
      getParent: getParent,
      set: set,
      getCurrentNodeId: getCurrentNodeId,
    })) as any;
    treeBuffer = new TreeBufferClass();

    const EventRegistererClass: jest.Mock<EventRegisterer> = jest.fn(
      () => ({})
    ) as any;
    eventRegisterer = new EventRegistererClass();

    tabOpen = jest.fn();
    open = jest.fn();
    getTree = jest.fn().mockImplementation(async () => {
      return [bookmark];
    });
    remove = jest.fn();
    const BookmarkRepositoryClass: jest.Mock<BookmarkRepository> = jest.fn(
      () => ({
        tabOpen: tabOpen,
        open: open,
        getTree: getTree,
        remove: remove,
      })
    ) as any;
    bookmarkRepository = new BookmarkRepositoryClass();

    const HighlightRepositoryClass: jest.Mock<HighlightRepository> = jest.fn(
      () => ({})
    ) as any;
    highlightRepository = new HighlightRepositoryClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRegisterer,
      highlightRepository,
      bookmarkRepository
    );

    id = "id";
    const BookmarkClass: jest.Mock<Bookmark> = jest.fn(() => ({
      id: id,
      url: "url",
    })) as any;
    bookmark = new BookmarkClass();

    const BookmarkDirectoryClass: jest.Mock<Bookmark> = jest.fn(() => ({
      id: id,
    })) as any;
    bookmarkDirectory = new BookmarkDirectoryClass();
  });

  it("tabOpenBookmark does nothing", async () => {
    await bookmarkTree.doAction("tabOpen", 1, 1);

    expect(tabOpen).not.toHaveBeenCalled();
  });

  it("tabOpenBookmark", async () => {
    getRangeModels = jest.fn().mockReturnValue([bookmark]);

    const TreeBufferClass: jest.Mock<TreeBuffer<Bookmark>> = jest.fn(() => ({
      getRangeModels: getRangeModels,
    })) as any;
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRegisterer,
      highlightRepository,
      bookmarkRepository
    );

    await bookmarkTree.doAction("tabOpen", 1, 1);

    expect(tabOpen).toHaveBeenCalledWith(id);
  });

  it("remove", async () => {
    getRangeModels = jest.fn().mockReturnValue([bookmark]);

    const TreeBufferClass: jest.Mock<TreeBuffer<Bookmark>> = jest.fn(() => ({
      getRangeModels: getRangeModels,
      getCurrentNodeId: getCurrentNodeId,
    })) as any;
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRegisterer,
      highlightRepository,
      bookmarkRepository
    );

    await bookmarkTree.doAction("remove", 1, 1);

    expect(remove).toHaveBeenCalledWith(id);
  });

  it("openParent does nothing", async () => {
    await bookmarkTree.doAction("openParent");

    expect(getTree).not.toHaveBeenCalled();
  });

  it("openBookmark opens a url", async () => {
    getCurrent = jest.fn().mockReturnValue(bookmark);

    const TreeBufferClass: jest.Mock<TreeBuffer<Bookmark>> = jest.fn(() => ({
      getCurrent: getCurrent,
    })) as any;
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRegisterer,
      highlightRepository,
      bookmarkRepository
    );

    await bookmarkTree.doAction("open");

    expect(open).toHaveBeenCalled();
  });

  it("openBookmark opens a directory", async () => {
    getCurrent = jest.fn().mockReturnValue(bookmarkDirectory);

    const TreeBufferClass: jest.Mock<TreeBuffer<Bookmark>> = jest.fn(() => ({
      getCurrent: getCurrent,
      set: set,
    })) as any;
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRegisterer,
      highlightRepository,
      bookmarkRepository
    );

    await bookmarkTree.doAction("open");

    expect(open).not.toHaveBeenCalled();
  });

  it("openBookmark opens a root directory", async () => {
    await bookmarkTree.doAction("open");

    expect(open).not.toHaveBeenCalled();
    expect(getTree).toHaveBeenCalledWith(null);
  });

  it("openParent", async () => {
    getParent = jest.fn().mockReturnValue(bookmark);

    const TreeBufferClass: jest.Mock<TreeBuffer<Bookmark>> = jest.fn(() => ({
      getParent: getParent,
      set: set,
    })) as any;
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRegisterer,
      highlightRepository,
      bookmarkRepository
    );

    await bookmarkTree.doAction("openParent");

    expect(getTree).toHaveBeenCalled();
  });
});

describe("BookmarkTreeItem", () => {
  let item: BookmarkTreeItem;
  let directoryItem: BookmarkTreeItem;
  let bookmark: Bookmark;
  let bookmarkDirectory: Bookmark;
  let id: string;

  beforeEach(() => {
    id = "id";
    const BookmarkClass: jest.Mock<Bookmark> = jest.fn(() => ({
      id: id,
      title: "title",
      url: "url",
    }));
    bookmark = new BookmarkClass();

    const BookmarkDirectoryClass: jest.Mock<Bookmark> = jest.fn(() => ({
      title: "title",
      id: id,
    }));
    bookmarkDirectory = new BookmarkDirectoryClass();

    item = new BookmarkTreeItem(bookmark);
    directoryItem = new BookmarkTreeItem(bookmarkDirectory);
  });

  it("bookmark toString", () => {
    expect("title\turl").toEqual(item.toString());
  });

  it("bookmarkDirectory toString", () => {
    expect("title/").toEqual(directoryItem.toString());
  });

  it("id", () => {
    expect(id).toEqual(item.id);
  });

  it("value", () => {
    expect(bookmark).toEqual(item.value);
  });

  it("isParent", () => {
    expect(false).toEqual(item.isParent);
  });
});
