import { BaseBuffer } from "./base";
import { Neovim, Buffer } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { BookmarkRepository, Bookmark } from "../repository/bookmark";
import { EventRepository } from "../repository/event";

export class BookmarkTree extends BaseBuffer {
  public readonly type = CtrlbBufferType.bookmarkTree;
  protected bookmarks: Bookmark[] = [];
  protected directoryId: string | null = null;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRepository: EventRepository,
    protected readonly bookmarkRepository: BookmarkRepository
  ) {
    super(vim, bufferContainer, eventRepository);
  }

  protected async setup(buffer: Buffer): Promise<void> {
    this.actions["open"] = (buffer: Buffer) => this.openBookmark(buffer);
    this.actions["tabOpen"] = (buffer: Buffer) => this.tabOpenBookmark(buffer);
    this.actions["openParent"] = (buffer: Buffer) => this.openParent(buffer);
    this.actions["debug"] = (buffer: Buffer) => this.debug(buffer);

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

    await this.openBookmark(buffer);
  }

  protected async getCurrent(): Promise<Bookmark | null> {
    const index = (await this.vim.call("line", ".")) - 1;
    if (index in this.bookmarks) {
      return this.bookmarks[index];
    }
    return null;
  }

  public async debug(buffer: Buffer) {
    const message = JSON.stringify(await this.getCurrent());
    await this.vim.command(`echomsg '${message}'`);
  }

  public async openParent(buffer: Buffer) {
    const bookmark = this.bookmarks.find(bookmark => {
      return bookmark.isParent || false;
    });

    if (bookmark === undefined) {
      return;
    }

    await this.openTree(buffer, bookmark.id);
  }

  public async openBookmark(buffer: Buffer) {
    const bookmark = await this.getCurrent();
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

    await this.openTree(buffer, id);
  }

  public async tabOpenBookmark(buffer: Buffer) {
    const bookmark = await this.getCurrent();
    if (bookmark === null || bookmark.url === undefined) {
      return;
    }

    await this.bookmarkRepository.tabOpen(bookmark.id);
  }

  protected async openTree(buffer: Buffer, id: string | null) {
    const bookmarks = await this.bookmarkRepository.getTree(id);

    let i = 0;
    await buffer.remove(0, this.bookmarks.length, false);
    for (const bookmark of bookmarks) {
      if (bookmark.url !== undefined) {
        await buffer.replace(bookmark.title + "\t" + bookmark.url, i);
      } else {
        await buffer.replace(bookmark.title + "/", i);
      }
      i++;
    }

    const lastBookmarkIndex = bookmarks.findIndex(bookmark => {
      return this.directoryId === bookmark.id;
    });
    if (lastBookmarkIndex !== -1) {
      this.vim.window.cursor = [lastBookmarkIndex + 1, 0];
    }

    this.directoryId = id;
    this.bookmarks = bookmarks;
  }
}
