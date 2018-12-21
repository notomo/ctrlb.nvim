import { Requester } from "../requester";
import { TabRepository } from "./tab";
import { ChildProcess } from "child_process";
import { WithError, NullableError } from "../error";

export type History = {
  title: string;
  url?: string;
};

export class HistoryRepository {
  constructor(
    protected readonly requester: Requester,
    protected readonly tabRepository: TabRepository
  ) {}

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

  public async onCreated(callback: {
    (history: History): void;
  }): Promise<ChildProcess> {
    return this.requester.receiveAsyncOnEvent<History>(
      {},
      { body: { eventName: "historyCreated" } },
      {},
      callback
    );
  }

  public async open(url: string): Promise<NullableError> {
    return this.tabRepository.open(url);
  }

  public async tabOpen(url: string): Promise<NullableError> {
    return this.tabRepository.tabOpen(url);
  }
}
