import { Requester } from "../requester";
import { ChildProcess } from "child_process";
import { WithError } from "../error";

export type Bookmark = {
  title: string;
  url?: string;
  id: string;
  parentId?: string;
  isParent?: boolean;
};

export class BookmarkRepository {
  constructor(protected readonly requester: Requester) {}

  public async getTree(id: string | null): Promise<WithError<Bookmark[]>> {
    const [bookmarks, error] = await this.requester.execute<Bookmark[]>({
      method: "bookmark/getTree",
      params: { id: id },
    });

    if (bookmarks === null) {
      return [[], error];
    }

    return [bookmarks, error];
  }

  public async open(id: string | null): Promise<ChildProcess> {
    return this.requester.executeAsync({
      method: "bookmark/open",
      params: { id: id },
    });
  }

  public async tabOpen(id: string | null): Promise<ChildProcess> {
    return this.requester.executeAsync({
      method: "bookmark/tabOpen",
      params: { id: id },
    });
  }
}
