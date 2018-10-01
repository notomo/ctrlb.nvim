import { BaseBuffer } from "./base";
import { Buffer } from "neovim";
import { CtrlbBufferType } from "./type";

type Tab = {
  title: string;
  url: string;
};

export class CurrentTab extends BaseBuffer {
  public readonly type = CtrlbBufferType.currentTab;

  protected async setup(buffer: Buffer): Promise<void> {
    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("buflisted", true);
    await buffer.setOption("modifiable", true);

    this.subscribe("tabActivated");
    this.subscribe("tabCreated");
    this.subscribe("tabRemoved");
    this.subscribe("tabUpdated");
    this.subscribe("windowActivated");
    this.subscribe("windowCreated");
    this.subscribe("windowRemoved");

    this.requester.receiveAsyncOnEvent(
      // TODO: receive only
      // ["tabActivated", "tabCreated", "tabRemoved", "tabUpdated", "windowActivated", "windowCreated", "windowRemoved"]
      { option: { eventName: true } },
      {},
      () => this.update(buffer)
    );

    await this.update(buffer);
  }

  protected isTab(tab: any): tab is Tab {
    return typeof tab.title === "string" && typeof tab.url === "string";
  }

  protected async update(buffer: Buffer) {
    const tab = await this.requester.execute<unknown>({
      actionGroupName: "tab",
      actionName: "getCurrent",
    });

    if (!this.isTab(tab)) {
      return;
    }

    await buffer.replace([tab.title, tab.url], 0);
  }
}
