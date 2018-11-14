import { Requester } from "../requester";
import { ChildProcess } from "child_process";

export type Bookmark = {
  title: string;
  url?: string;
  id: string;
  parentId?: string;
  isParent?: boolean;
};

export class BookmarkRepository {
  constructor(protected readonly requester: Requester) {}

  public async getTree(id: string | null): Promise<Bookmark[]> {
    return this.requester.execute<Bookmark[]>({
      method: "bookmark/getTree",
      params: { id: id },
    });
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
