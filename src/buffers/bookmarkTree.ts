import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { TreeBuffer } from "./tree";
import { HighlightRepository } from "../repository/highlight";
import { BookmarkRepository, Bookmark } from "../repository/bookmark";
import { EventRegisterer } from "./event";

export class BookmarkTreeItem {
  constructor(protected readonly bookmark: Bookmark) {}

  public toString(): string {
    if (this.bookmark.url !== undefined) {
      return this.bookmark.title + "\t" + this.bookmark.url;
    }
    return this.bookmark.title + "/";
  }

  public get value(): Bookmark {
    return this.bookmark;
  }

  public get id(): string {
    return this.bookmark.id;
  }

  public get isParent(): boolean {
    return this.bookmark.isParent || false;
  }
}

export class BookmarkTree extends BaseBuffer {
  public static readonly type = CtrlbBufferType.bookmarkTree;

  protected readonly options = {
    buftype: "nofile",
    swapfile: false,
    modifiable: true,
    undolevels: -1,
  };

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly treeBuffer: TreeBuffer<Bookmark>,
    protected readonly eventRegisterer: EventRegisterer,
    protected readonly highlightRepository: HighlightRepository,
    protected readonly bookmarkRepository: BookmarkRepository
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["open"] = () => this.openBookmark();
    this.actions["tabOpen"] = (firstLine: number, lastLine: number) =>
      this.tabOpenBookmark(firstLine, lastLine);
    this.actions["openParent"] = () => this.openParent();
    this.actions["debug"] = async () =>
      this.debug(await this.treeBuffer.getCurrent());
    this.actions["read"] = () => this.read();
    this.actions["highlight"] = () => this.highlight();
    this.actions["remove"] = (firstLine: number, lastLine: number) =>
      this.remove(firstLine, lastLine);
  }

  protected async setup(): Promise<void> {
    await Promise.all([
      this.highlightRepository.link("CtrlbBookmarkTreeDirectory", "String"),
      this.highlightRepository.link("CtrlbBookmarkTreeUrl", "Underlined"),
    ]);
    await this.highlight();

    await this.bufferContainer.defineReadAction("read");
    await this.bufferContainer.defineEnableHighlightAction("highlight");

    this.read();
  }

  protected async highlight() {
    await Promise.all([
      this.highlightRepository.match(
        "CtrlbBookmarkTreeDirectory",
        "^[^[:tab:]]*\\/$"
      ),
      this.highlightRepository.match(
        "CtrlbBookmarkTreeUrl",
        "[[:tab:]]\\zs.*$"
      ),
    ]);
  }

  public async read() {
    const id = await this.treeBuffer.getCurrentNodeId();
    await this.openTree(id);
  }

  public async openParent() {
    const bookmark = await this.treeBuffer.getParent();

    if (bookmark === null) {
      return;
    }

    await this.openTree(bookmark.id);
  }

  public async openBookmark() {
    const bookmark = await this.treeBuffer.getCurrent();
    let id = null;
    let url = undefined;
    if (bookmark !== null) {
      id = bookmark.id;
      url = bookmark.url;
    }
    if (url !== undefined) {
      await this.bookmarkRepository.open(id);
      return;
    }

    await this.openTree(id);
  }

  public async tabOpenBookmark(firstLine: number, lastLine: number) {
    const ids = (await this.treeBuffer.getRangeModels(firstLine, lastLine))
      .map(bookmark => bookmark.id)
      .filter((id): id is string => id !== undefined);

    await this.bookmarkRepository.tabOpen(ids);
  }

  public async remove(firstLine: number, lastLine: number) {
    const ids = (await this.treeBuffer.getRangeModels(firstLine, lastLine))
      .map(bookmark => bookmark.id)
      .filter((id): id is string => id !== undefined);

    await this.bookmarkRepository.remove(ids);
    await this.read();
  }

  protected async openTree(id: string | null) {
    const [bookmarks, error] = await this.bookmarkRepository.getTree(id);

    if (error !== null) {
      return;
    }

    const items = bookmarks.map(bookmark => {
      return new BookmarkTreeItem(bookmark);
    });

    await this.treeBuffer.set(items, id);
  }
}
