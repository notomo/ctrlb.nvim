import { BookmarkTree, BookmarkTreeItem } from "./bookmarkTree";
import { TreeBuffer } from "./tree";
import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { EventRepository } from "../repository/event";
import { BookmarkRepository, Bookmark } from "../repository/bookmark";

describe("BookmarkTree", () => {
  let vim: Neovim;
  let bufferContainer: BufferContainer;
  let treeBuffer: TreeBuffer<Bookmark>;
  let eventRepository: EventRepository;
  let bookmarkRepository: BookmarkRepository;
  let bookmarkTree: BookmarkTree;

  let getCurrent: jest.Mock;
  let getParent: jest.Mock;
  let tabOpen: jest.Mock;
  let open: jest.Mock;
  let getTree: jest.Mock;
  let set: jest.Mock;

  let bookmark: Bookmark;
  let id: string;
  let bookmarkDirectory: Bookmark;

  beforeEach(() => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    const BufferContainerClass = jest.fn<BufferContainer>(() => ({}));
    bufferContainer = new BufferContainerClass();

    getCurrent = jest.fn().mockReturnValue(null);
    getParent = jest.fn().mockReturnValue(null);
    set = jest.fn();
    const TreeBufferClass = jest.fn<TreeBuffer<Bookmark>>(() => ({
      getCurrent: getCurrent,
      getParent: getParent,
      set: set,
    }));
    treeBuffer = new TreeBufferClass();

    const EventRepositoryClass = jest.fn<EventRepository>(() => ({}));
    eventRepository = new EventRepositoryClass();

    tabOpen = jest.fn();
    open = jest.fn();
    getTree = jest.fn().mockImplementation(async () => {
      return [bookmark];
    });
    const BookmarkRepositoryClass = jest.fn<BookmarkRepository>(() => ({
      tabOpen: tabOpen,
      open: open,
      getTree: getTree,
    }));
    bookmarkRepository = new BookmarkRepositoryClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRepository,
      bookmarkRepository
    );

    id = "id";
    const BookmarkClass = jest.fn<Bookmark>(() => ({
      id: id,
      url: "url",
    }));
    bookmark = new BookmarkClass();

    const BookmarkDirectoryClass = jest.fn<Bookmark>(() => ({
      id: id,
    }));
    bookmarkDirectory = new BookmarkDirectoryClass();
  });

  it("tabOpenBookmark does nothing", async () => {
    await bookmarkTree.tabOpenBookmark();

    expect(tabOpen).not.toHaveBeenCalled();
  });

  it("tabOpenBookmark", async () => {
    getCurrent = jest.fn().mockReturnValue(bookmark);

    const TreeBufferClass = jest.fn<TreeBuffer<Bookmark>>(() => ({
      getCurrent: getCurrent,
    }));
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRepository,
      bookmarkRepository
    );

    await bookmarkTree.tabOpenBookmark();

    expect(tabOpen).toHaveBeenCalledWith(id);
  });

  it("openParent does nothing", async () => {
    await bookmarkTree.openParent();

    expect(getTree).not.toHaveBeenCalled();
  });

  it("openBookmark opens a url", async () => {
    getCurrent = jest.fn().mockReturnValue(bookmark);

    const TreeBufferClass = jest.fn<TreeBuffer<Bookmark>>(() => ({
      getCurrent: getCurrent,
    }));
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRepository,
      bookmarkRepository
    );

    await bookmarkTree.openBookmark();

    expect(open).toHaveBeenCalled();
  });

  it("openBookmark opens a directory", async () => {
    getCurrent = jest.fn().mockReturnValue(bookmarkDirectory);

    const TreeBufferClass = jest.fn<TreeBuffer<Bookmark>>(() => ({
      getCurrent: getCurrent,
      set: set,
    }));
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRepository,
      bookmarkRepository
    );

    await bookmarkTree.openBookmark();

    expect(open).not.toHaveBeenCalled();
  });

  it("openBookmark opens a root directory", async () => {
    await bookmarkTree.openBookmark();

    expect(open).not.toHaveBeenCalled();
    expect(getTree).toHaveBeenCalledWith(null);
  });

  it("openParent", async () => {
    getParent = jest.fn().mockReturnValue(bookmark);

    const TreeBufferClass = jest.fn<TreeBuffer<Bookmark>>(() => ({
      getParent: getParent,
      set: set,
    }));
    treeBuffer = new TreeBufferClass();

    bookmarkTree = new BookmarkTree(
      vim,
      bufferContainer,
      treeBuffer,
      eventRepository,
      bookmarkRepository
    );

    await bookmarkTree.openParent();

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
    const BookmarkClass = jest.fn<Bookmark>(() => ({
      id: id,
      title: "title",
      url: "url",
    }));
    bookmark = new BookmarkClass();

    const BookmarkDirectoryClass = jest.fn<Bookmark>(() => ({
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
