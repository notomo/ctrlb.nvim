import { Requester } from "../requester";
import { ChildProcess } from "child_process";

export type History = {
  title: string;
  url?: string;
};

export class HistoryRepository {
  constructor(protected readonly requester: Requester) {}

  public async search(): Promise<History[]> {
    return this.requester.execute<History[]>({
      method: "history/search",
      params: {},
    });
  }

  public onCreated(callback: { (history: History): void }): ChildProcess {
    return this.requester.receiveAsyncOnEvent<History>(
      {},
      { body: { eventName: "historyCreated" } },
      {},
      callback
    );
  }
}