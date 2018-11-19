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
    buftype: "acwrite",
    swapfile: false,
    buflisted: true,
    modifiable: true,
    modified: false,
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
    this.actions["save"] = async () => this.save();
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

    const bufferId = (await this.bufferContainer.get()).id;
    await this.vim.command(
      `autocmd BufWriteCmd <buffer=${bufferId}> call ctrlb#do_action(${
        CurrentTab.type
      }, "save")`
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

    if (this.bufferOptionStore !== null) {
      await this.bufferOptionStore.set({ modified: false });
    }
  }

  protected async save() {
    const buffer = await this.bufferContainer.get();
    const lines = await buffer.lines;
    if (lines.length <= 1) {
      return;
    }

    await this.tabRepository.open(lines[1]);

    if (this.bufferOptionStore !== null) {
      await this.bufferOptionStore.set({ modified: false });
    }
  }
}
