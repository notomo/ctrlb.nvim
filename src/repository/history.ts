import { Requester } from "../requester";
import { ChildProcess } from "child_process";
import { WithError, NullableError } from "../error";

export type History = {
  title: string;
  url?: string;
};

export class HistoryRepository {
  constructor(protected readonly requester: Requester) {}

  public async search(): Promise<WithError<ReadonlyArray<History>>> {
    const [histories, error] = await this.requester.execute<History[]>({
      method: "history/search",
      params: {},
    });

    if (histories === null) {
      return [[], error];
    }

    return [histories, error];
  }

  public async remove(url: string): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "history/remove",
      params: { url: url },
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
