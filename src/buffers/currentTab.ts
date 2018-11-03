import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { CtrlbBufferType } from "./type";
import { TabRepository, Tab } from "../repository/tab";
import { BufferContainer } from "./container";
import { ItemBuffer } from "./item";
import { EventRegisterer } from "./event";

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

  protected readonly options = {
    buftype: "nofile",
    swapfile: false,
    buflisted: true,
    modifiable: true,
  };

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly itemBuffer: ItemBuffer<Tab>,
    protected readonly eventRegisterer: EventRegisterer,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["debug"] = async () =>
      this.debug(await this.itemBuffer.getCurrent());
  }

  protected async setup(): Promise<void> {
    const p = this.tabRepository.onChanged(data => this.update());
    this.eventRegisterer.subscribe(
      p,
      "tabActivated",
      "tabCreated",
      "tabRemoved",
      "tabUpdated",
      "windowActivated",
      "windowCreated",
      "windowRemoved"
    );

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
