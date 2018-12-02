import { Requester } from "../requester";
import { ChildProcess } from "child_process";
import { WithError, NullableError } from "../error";

export type Tab = {
  id?: number;
  title: string;
  url: string;
  active: boolean;
};

export class TabRepository {
  constructor(protected readonly requester: Requester) {}

  public async getCurrent(): Promise<WithError<Tab | null>> {
    return this.requester.execute<Tab>({
      method: "tab/getCurrent",
    });
  }

  public async getListAll(): Promise<WithError<Tab[]>> {
    const [tabs, error] = await this.requester.execute<Tab[]>({
      method: "tab/listAll",
    });

    if (tabs === null) {
      return [[], error];
    }

    return [tabs, null];
  }

  public async close(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/close",
      params: { id: id },
    });
  }

  public async duplicate(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/duplicate",
      params: { id: id },
    });
  }

  public async reload(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/reload",
      params: { id: id },
    });
  }

  public async activate(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/activate",
      params: { id: id },
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

  public async zoomUp(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/zoom/up",
      params: { id: id },
    });
  }

  public async zoomDown(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/zoom/down",
      params: { id: id },
    });
  }

  public async zoomReset(id: number): Promise<NullableError> {
    return this.requester.executeAsync({
      method: "tab/zoom/reset",
      params: { id: id },
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
      callback,
      50
    );
  }
}
