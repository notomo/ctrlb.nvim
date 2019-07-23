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

  public async getListAll(): Promise<WithError<ReadonlyArray<Tab>>> {
    const [tabs, error] = await this.requester.execute<Tab[]>({
      method: "tab/listAll",
    });

    if (tabs === null) {
      return [[], error];
    }

    return [tabs, null];
  }

  public async close(ids: ReadonlyArray<number>): Promise<NullableError> {
    return this.requester.batchNotify(
      ids.map(id => {
        return { method: "tab/close", params: { id: id } };
      })
    );
  }

  public async duplicate(ids: ReadonlyArray<number>): Promise<NullableError> {
    return this.requester.batchNotify(
      ids.map(id => {
        return { method: "tab/duplicate", params: { id: id } };
      })
    );
  }

  public async reload(ids: ReadonlyArray<number>): Promise<NullableError> {
    return this.requester.batchNotify(
      ids.map(id => {
        return { method: "tab/reload", params: { id: id } };
      })
    );
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

  public async tabOpen(urls: ReadonlyArray<string>): Promise<NullableError> {
    return this.requester.batchNotify(
      urls.map(url => {
        return { method: "tab/tabOpen", params: { url: url } };
      })
    );
  }

  public async zoomUp(ids: ReadonlyArray<number>): Promise<NullableError> {
    return this.requester.batchNotify(
      ids.map(id => {
        return { method: "tab/zoom/up", params: { id: id } };
      })
    );
  }

  public async zoomDown(ids: ReadonlyArray<number>): Promise<NullableError> {
    return this.requester.batchNotify(
      ids.map(id => {
        return { method: "tab/zoom/down", params: { id: id } };
      })
    );
  }

  public async zoomReset(ids: ReadonlyArray<number>): Promise<NullableError> {
    return this.requester.batchNotify(
      ids.map(id => {
        return { method: "tab/zoom/reset", params: { id: id } };
      })
    );
  }

  public async onChanged(callback: {
    (tab: Tab): void;
  }): Promise<ChildProcess> {
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
