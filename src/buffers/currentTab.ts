import { BaseBuffer } from "./base";
import { Neovim, Buffer } from "neovim";
import { CtrlbBufferType } from "./type";
import { TabRepository, Tab } from "../repository/tab";
import { BufferContainer } from "./container";
import { ItemBuffer } from "./item";
import { EventRepository } from "../repository/event";

class CurrentTabItem {
  constructor(protected readonly tab: Tab) {}

  public toStrings(): string[] {
    return [this.tab.title, this.tab.url];
  }

  public get value(): Tab {
    return this.tab;
  }
}

export class CurrentTab extends BaseBuffer {
  public static readonly type = CtrlbBufferType.currentTab;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly itemBuffer: ItemBuffer<Tab>,
    protected readonly eventRepository: EventRepository,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRepository);
    this.actions["debug"] = async () =>
      this.debug(await this.itemBuffer.getCurrent());
  }

  protected async setup(buffer: Buffer): Promise<void> {
    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("buflisted", true);
    await buffer.setOption("modifiable", true);

    this.subscribe(
      "tabActivated",
      "tabCreated",
      "tabRemoved",
      "tabUpdated",
      "windowActivated",
      "windowCreated",
      "windowRemoved"
    );

    const p = this.tabRepository.onChanged(data => this.update());
    this.receivers.push(p);

    await this.update();
  }

  protected isTab(tab: any): tab is Tab {
    return typeof tab.title === "string" && typeof tab.url === "string";
  }

  protected async update() {
    const tab = await this.tabRepository.getCurrent();

    if (!this.isTab(tab)) {
      return;
    }

    const item = new CurrentTabItem(tab);
    await this.itemBuffer.set(item);
  }
}
