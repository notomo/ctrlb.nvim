import { BaseBuffer } from "./base";
import { Buffer } from "neovim";
import { CtrlbBufferType } from "./type";

export class CurrentTab extends BaseBuffer {
  public readonly type = CtrlbBufferType.currentTab;

  protected async setup(buffer: Buffer): Promise<void> {
    buffer.setOption("buftype", "nofile");
    buffer.setOption("swapfile", false);
    buffer.setOption("buflisted", true);
    buffer.setOption("modifiable", true);

    this.subscribe("tabActivated");
    this.subscribe("tabCreated");
    this.subscribe("tabRemoved");
    this.subscribe("tabUpdated");
    this.subscribe("windowActivated");
    this.subscribe("windowCreated");
    this.subscribe("windowRemoved");

    const p = this.requester.receiveAsync(
      { body: { title: true, url: true } },
      {}
    );
    p.stdout.setEncoding("utf-8");
    p.stdout.on("data", data => {
      const tab: { body: { title: string; url: string } } = JSON.parse(
        (data as string).trim().split("\n")[0]
      );
      buffer.replace(tab.body.title, 0);
      buffer.replace(tab.body.url, 1);
    });
  }
}
