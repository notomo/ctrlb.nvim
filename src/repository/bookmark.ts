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
      actionGroupName: "bookmark",
      actionName: "getTree",
      args: { id: id },
    });
  }

  public async open(id: string | null): Promise<ChildProcess> {
    return this.requester.executeAsync({
      actionGroupName: "bookmark",
      actionName: "open",
      args: { id: id },
    });
  }

  public async tabOpen(id: string | null): Promise<ChildProcess> {
    return this.requester.executeAsync({
      actionGroupName: "bookmark",
      actionName: "tabOpen",
      args: { id: id },
    });
  }
}
