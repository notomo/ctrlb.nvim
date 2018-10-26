import { BaseBuffer } from "./base";
import { Neovim, Buffer } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { TreeBuffer } from "./tree";
import { BookmarkRepository, Bookmark } from "../repository/bookmark";
import { EventRepository } from "../repository/event";

export class BookmarkTreeItem {
  constructor(protected readonly bookmark: Bookmark) {}

  public toString(): string {
    if (this.bookmark.url !== undefined) {
      return this.bookmark.title + "\t" + this.bookmark.url;
    }
    return this.bookmark.title + "/";
  }

  public toValue(): Bookmark {
    return this.bookmark;
  }

  get id(): string {
    return this.bookmark.id;
  }

  get isParent(): boolean {
    return this.bookmark.isParent || false;
  }
}

export class BookmarkTree extends BaseBuffer {
  public static readonly type = CtrlbBufferType.bookmarkTree;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly treeBuffer: TreeBuffer<Bookmark>,
    protected readonly eventRepository: EventRepository,
    protected readonly bookmarkRepository: BookmarkRepository
  ) {
    super(vim, bufferContainer, eventRepository);
  }

  protected async setup(buffer: Buffer): Promise<void> {
    this.actions["open"] = (buffer: Buffer) => this.openBookmark();
    this.actions["tabOpen"] = (buffer: Buffer) => this.tabOpenBookmark();
    this.actions["openParent"] = (buffer: Buffer) => this.openParent();
    this.actions["debug"] = (buffer: Buffer) => this.debug();

    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("modifiable", true);

    await this.vim.command(
      "highlight default link CtrlbBookmarkTreeDirectory String"
    );
    await this.vim.command(
      "syntax match CtrlbBookmarkTreeDirectory /^[^[:tab:]]*\\/$/"
    );

    await this.vim.command(
      "highlight default link CtrlbBookmarkTreeUrl Underlined"
    );
    await this.vim.command(
      "syntax match CtrlbBookmarkTreeUrl /[[:tab:]]\\zs.*$/"
    );

    await this.openBookmark();
  }

  public async debug() {
    const message = JSON.stringify(await this.treeBuffer.getCurrent());
    await this.vim.command(`echomsg '${message}'`);
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

  public async tabOpenBookmark() {
    const bookmark = await this.treeBuffer.getCurrent();
    if (bookmark === null || bookmark.url === undefined) {
      return;
    }

    await this.bookmarkRepository.tabOpen(bookmark.id);
  }

  protected async openTree(id: string | null) {
    const items = (await this.bookmarkRepository.getTree(id)).map(bookmark => {
      return new BookmarkTreeItem(bookmark);
    });
    await this.treeBuffer.set(items, id);
  }
}
