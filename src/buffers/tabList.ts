import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { ListBuffer } from "./list";
import { HighlightRepository } from "../repository/highlight";
import { TabRepository, Tab } from "../repository/tab";
import { EventRegisterer } from "./event";

export class TabListItem {
  constructor(protected readonly tab: Tab) {}

  public toString(): string {
    if (this.tab.active) {
      return "|" + this.tab.title + "\t" + this.tab.url;
    }
    return " " + this.tab.title + "\t" + this.tab.url;
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
    protected readonly highlightRepository: HighlightRepository,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["debug"] = async () =>
      this.debug(await this.listBuffer.getCurrent());
    this.actions["zoomUp"] = (firstLine: number, lastLine: number) =>
      this.zoomUp(firstLine, lastLine);
    this.actions["zoomDown"] = (firstLine: number, lastLine: number) =>
      this.zoomDown(firstLine, lastLine);
    this.actions["zoomReset"] = (firstLine: number, lastLine: number) =>
      this.zoomReset(firstLine, lastLine);
    this.actions["activate"] = () => this.activate();
    this.actions["reload"] = (firstLine: number, lastLine: number) =>
      this.reload(firstLine, lastLine);
    this.actions["close"] = (firstLine: number, lastLine: number) =>
      this.close(firstLine, lastLine);
    this.actions["duplicate"] = (firstLine: number, lastLine: number) =>
      this.duplicate(firstLine, lastLine);
    this.actions["read"] = () => this.read();
    this.actions["highlight"] = () => this.highlight();
  }

  protected async setup(): Promise<void> {
    await this.highlightRepository.link("CtrlbTabListUrl", "Underlined");
    await this.highlightRepository.link("CtrlbTabListActive", "Title");
    await this.highlight();

    const p = this.tabRepository.onChanged(data => this.read());
    this.eventRegisterer.subscribe(p);

    await this.bufferContainer.defineReadAction("read");
    await this.bufferContainer.defineEnableHighlightAction("highlight");

    this.read();
  }

  protected async highlight() {
    await this.highlightRepository.match("CtrlbTabListActive", "^|.*", [
      "CtrlbTabListUrl",
    ]);
    await this.highlightRepository.match("CtrlbTabListUrl", "[[:tab:]]\\zs.*$");
  }

  protected async read() {
    const [tabs, error] = await this.tabRepository.getListAll();

    if (error !== null) {
      return;
    }

    const items = tabs.map(tab => {
      return new TabListItem(tab);
    });

    await this.listBuffer.set(items);
  }

  public async activate() {
    const tab = await this.listBuffer.getCurrent();
    if (tab === null) {
      return;
    }

    const id = tab.id;
    if (id === undefined) {
      return;
    }
    this.tabRepository.activate(id);
  }

  public async close(firstLine: number, lastLine: number) {
    (await this.getIds(firstLine, lastLine)).map(id =>
      this.tabRepository.close(id)
    );
  }

  public async duplicate(firstLine: number, lastLine: number) {
    (await this.getIds(firstLine, lastLine)).map(id =>
      this.tabRepository.duplicate(id)
    );
  }

  public async reload(firstLine: number, lastLine: number) {
    (await this.getIds(firstLine, lastLine)).map(id =>
      this.tabRepository.reload(id)
    );
  }

  public async zoomUp(firstLine: number, lastLine: number) {
    (await this.getIds(firstLine, lastLine)).map(id =>
      this.tabRepository.zoomUp(id)
    );
  }

  public async zoomDown(firstLine: number, lastLine: number) {
    (await this.getIds(firstLine, lastLine)).map(id =>
      this.tabRepository.zoomDown(id)
    );
  }

  public async zoomReset(firstLine: number, lastLine: number) {
    (await this.getIds(firstLine, lastLine)).map(id =>
      this.tabRepository.zoomReset(id)
    );
  }

  protected async getIds(
    firstLine: number,
    lastLine: number
  ): Promise<ReadonlyArray<number>> {
    return (await this.listBuffer.getRangeModels(firstLine, lastLine))
      .map(tab => tab.id)
      .filter((id): id is number => id !== undefined);
  }
}
