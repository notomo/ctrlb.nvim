import { Requester } from "../requester";
import { WithError, NullableError } from "../error";

export type Bookmark = {
  title: string;
  url?: string;
  id: string;
  parentId?: string;
  isParent?: boolean;
};

export class BookmarkRepository {
  constructor(protected readonly requester: Requester) {}

  public async getTree(
    id: string | null
  ): Promise<WithError<ReadonlyArray<Bookmark>>> {
    const [bookmarks, error] = await this.requester.execute<Bookmark[]>({
      method: "bookmark/getTree",
      params: { id: id },
    });

    if (bookmarks === null) {
      return [[], error];
    }

    return [bookmarks, error];
  }

  public async open(id: string | null): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "bookmark/open",
      params: { id: id },
    });
  }

  public async tabOpen(id: string | null): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "bookmark/tabOpen",
      params: { id: id },
    });
  }

  public async remove(id: string): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "bookmark/remove",
      params: { id: id },
    });
  }
}
