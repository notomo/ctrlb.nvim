import { Requester } from "../requester";
import { ChildProcess } from "child_process";

export type Download = {
  filename: string;
  url: string;
};

export class DownloadRepository {
  constructor(protected readonly requester: Requester) {}

  public async search(): Promise<Download[]> {
    return this.requester.execute<Download[]>({
      actionGroupName: "download",
      actionName: "search",
      args: {},
    });
  }

  public onCreated(callback: { (download: Download): void }): ChildProcess {
    return this.requester.receiveAsyncOnEvent<Download>(
      {},
      { body: { eventName: "downloadCreated" } },
      callback
    );
  }
}
