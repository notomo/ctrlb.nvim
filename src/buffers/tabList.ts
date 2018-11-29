import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { ListBuffer } from "./list";
import { TabRepository, Tab } from "../repository/tab";
import { EventRegisterer } from "./event";

export class TabListItem {
  constructor(protected readonly tab: Tab) {}

  public toString(): string {
    return this.tab.title + "\t" + this.tab.url;
  }

  public get value(): Tab {
    return this.tab;
  }
}

export class TabList extends BaseBuffer {
  public static readonly type = CtrlbBufferType.tabList;

  protected readonly options = {
    buftype: "nofile",
    buflisted: true,
    swapfile: false,
    modifiable: false,
    undolevels: -1,
  };

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly listBuffer: ListBuffer<Tab>,
    protected readonly eventRegisterer: EventRegisterer,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["debug"] = async () =>
      this.debug(await this.listBuffer.getCurrent());
  }

  protected async setup(): Promise<void> {
    await this.vim.command("highlight default link CtrlbTabListUrl Underlined");
    await this.vim.command("syntax match CtrlbTabListUrl /[[:tab:]]\\zs.*$/");

    this.set();
  }

  protected async set() {
    const [tabs, error] = await this.tabRepository.getList();

    if (error !== null) {
      return;
    }

    const items = tabs.map(tab => {
      return new TabListItem(tab);
    });

    await this.listBuffer.set(items);
  }
}
