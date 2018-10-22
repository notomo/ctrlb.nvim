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
      actionGroupName: "tab",
      actionName: "getCurrent",
    });
  }

  public async open(url: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      actionGroupName: "tab",
      actionName: "open",
      args: { url: url },
    });
  }

  public async tabOpen(url: string): Promise<ChildProcess> {
    return this.requester.executeAsync({
      actionGroupName: "tab",
      actionName: "tabOpen",
      args: { url: url },
    });
  }

  public onChanged(callback: { (tab: Tab): void }): ChildProcess {
    return this.requester.receiveAsyncOnEvent<Tab>(
      // TODO: receive only
      // ["tabActivated", "tabCreated", "tabRemoved", "tabUpdated", "windowActivated", "windowCreated", "windowRemoved"]
      { option: { eventName: true } },
      {},
      callback
    );
  }
}
