import { BaseBuffer } from "./base";
import { Neovim, Buffer } from "neovim";
import { CtrlbBufferType } from "./type";
import { TabRepository, Tab } from "../repository/tab";
import { BufferContainer } from "./container";
import { EventRepository } from "../repository/event";

export class CurrentTab extends BaseBuffer {
  public readonly type = CtrlbBufferType.currentTab;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRepository: EventRepository,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRepository);
  }

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

    const p = this.tabRepository.onChanged(data => this.update(buffer));
    this.receivers.push(p);

    await this.update(buffer);
  }

  protected isTab(tab: any): tab is Tab {
    return typeof tab.title === "string" && typeof tab.url === "string";
  }

  protected async update(buffer: Buffer) {
    const tab = await this.tabRepository.getCurrent();

    if (!this.isTab(tab)) {
      return;
    }

    await buffer.replace([tab.title, tab.url], 0);
  }
}
