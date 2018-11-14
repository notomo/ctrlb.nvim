import { Requester } from "../requester";
import { ChildProcess } from "child_process";

export type Tab = {
  title: string;
  url: string;
};

export class TabRepository {
  constructor(protected readonly requester: Requester) {}

  public async getCurrent(): Promise<Tab> {
    return this.requester.execute<Tab>({
      method: "tab/getCurrent",
    });
  }

  public async open(url: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      method: "tab/open",
      params: { url: url },
    });
  }

  public async tabOpen(url: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      method: "tab/tabOpen",
      params: { url: url },
    });
  }

  public onChanged(callback: { (tab: Tab): void }): ChildProcess {
    return this.requester.receiveAsyncOnEvent<Tab>(
      // TODO: receive only
      // ["tabActivated", "tabCreated", "tabRemoved", "tabUpdated", "windowActivated", "windowCreated", "windowRemoved"]
      { body: { eventName: true } },
      {},
      callback
    );
  }
}
