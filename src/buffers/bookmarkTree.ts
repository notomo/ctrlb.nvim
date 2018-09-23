import { BaseBuffer } from "./base";
import { Buffer } from "neovim";
import { CtrlbBufferType } from "./type";

type Bookmark = { title: string; url?: string; id: string; parentId?: string };

export class BookmarkTree extends BaseBuffer {
  public readonly type = CtrlbBufferType.bookmarkTree;
  protected bookmarks: Bookmark[] = [];

  protected async setup(buffer: Buffer): Promise<void> {
    this.actions["open"] = (buffer: Buffer) => this.openBookmark(buffer);

    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("modifiable", true);

    await this.openBookmark(buffer);
  }

  protected async getCurrent(): Promise<Bookmark | null> {
    const row = await this.vim.call("line", ".");
    if (row in this.bookmarks) {
      return this.bookmarks[row - 1];
    }
    return null;
  }

  public async openBookmark(buffer: Buffer) {
    const bookmark = await this.getCurrent();
    let id = null;
    let url = undefined;
    if (bookmark !== null) {
      id = Number(bookmark.id);
      url = bookmark.url;
    }
    if (url !== undefined) {
      await this.requester.executeAsync({
        actionGroupName: "bookmark",
        actionName: "open",
        args: { id: id },
      });
      return;
    }

    await this.openTree(buffer, id);
  }

  protected async openTree(buffer: Buffer, id: number | null) {
    const bookmarks = await this.requester.execute<Bookmark[]>({
      actionGroupName: "bookmark",
      actionName: "getTree",
      args: { id: id },
    });

    let i = 0;
    await buffer.remove(0, this.bookmarks.length, false);
    for (const bookmark of bookmarks) {
      if (bookmark.url !== undefined) {
        buffer.replace(bookmark.title + "\t" + bookmark.url, i);
      } else {
        buffer.replace(bookmark.title, i);
      }
      i++;
    }
    this.bookmarks = bookmarks;
  }
}
