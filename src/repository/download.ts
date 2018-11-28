import { Requester } from "../requester";
import { ChildProcess } from "child_process";
import { WithError } from "../error";

export type Download = {
  filename: string;
  url: string;
};

export class DownloadRepository {
  constructor(protected readonly requester: Requester) {}

  public async search(): Promise<WithError<Download[]>> {
    const [downloads, error] = await this.requester.execute<Download[]>({
      method: "download/search",
      params: {},
    });

    if (downloads === null) {
      return [[], error];
    }

    return [downloads, error];
  }

  public onCreated(callback: { (download: Download): void }): ChildProcess {
    return this.requester.receiveAsyncOnEvent<Download>(
      {},
      { body: { eventName: "downloadCreated" } },
      {},
      callback
    );
  }
}
