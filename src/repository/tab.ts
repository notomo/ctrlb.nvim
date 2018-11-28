import { Requester } from "../requester";
import { ChildProcess } from "child_process";
import { WithError, NullableError } from "../error";

export type Tab = {
  title: string;
  url: string;
};

export class TabRepository {
  constructor(protected readonly requester: Requester) {}

  public async getCurrent(): Promise<WithError<Tab | null>> {
    return this.requester.execute<Tab>({
      method: "tab/getCurrent",
    });
  }

  public async open(url: string): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/open",
      params: { url: url },
    });
  }

  public async tabOpen(url: string): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/tabOpen",
      params: { url: url },
    });
  }

  public onChanged(callback: { (tab: Tab): void }): ChildProcess {
    return this.requester.receiveAsyncOnEvent<Tab>(
      {},
      {},
      {
        body: {
          eventName:
            "tabActivated|tabCreated|tabRemoved|tabUpdated|windowActivated|windowCreated|windowRemoved",
        },
      },
      callback
    );
  }
}
