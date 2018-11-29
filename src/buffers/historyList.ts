import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { ListBuffer } from "./list";
import { HistoryRepository, History } from "../repository/history";
import { TabRepository } from "../repository/tab";
import { EventRegisterer } from "./event";

export class HistoryListItem {
  constructor(protected readonly history: History) {}

  public toString(): string {
    return this.history.title + "\t" + this.history.url;
  }

  public get value(): History {
    return this.history;
  }
}

export class HistoryList extends BaseBuffer {
  public static readonly type = CtrlbBufferType.historyList;

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
    protected readonly listBuffer: ListBuffer<History>,
    protected readonly eventRegisterer: EventRegisterer,
    protected readonly historyRepository: HistoryRepository,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["tabOpen"] = (firstLine: number, lastLine: number) =>
      this.tabOpenHistory(firstLine, lastLine);
    this.actions["remove"] = (firstLine: number, lastLine: number) =>
      this.remove(firstLine, lastLine);
    this.actions["open"] = () => this.openHistory();
    this.actions["debug"] = async () =>
      this.debug(await this.listBuffer.getCurrent());
  }

  protected async setup(): Promise<void> {
    await this.vim.command(
      "highlight default link CtrlbHistoryListUrl Underlined"
    );
    await this.vim.command(
      "syntax match CtrlbHistoryListUrl /[[:tab:]]\\zs.*$/"
    );

    const p = this.historyRepository.onCreated(history => this.update(history));
    this.eventRegisterer.subscribe(p, "historyCreated");

    this.set();
  }

  protected async update(history: History) {
    const item = new HistoryListItem(history);
    await this.listBuffer.prepend(item);
  }

  public async openHistory() {
    const history = await this.listBuffer.getCurrent();
    if (history === null || history.url === undefined) {
      return;
    }

    await this.tabRepository.open(history.url);
  }

  protected async set() {
    const [histories, error] = await this.historyRepository.search();

    if (error !== null) {
      return;
    }

    const items = histories.map(history => {
      return new HistoryListItem(history);
    });

    await this.listBuffer.set(items);
  }

  public async remove(firstLine: number, lastLine: number) {
    const histories = await this.listBuffer.getRangeModels(firstLine, lastLine);
    for (const history of histories) {
      if (history.url === undefined) {
        return;
      }

      await this.historyRepository.remove(history.url);
    }

    await this.set();
  }

  public async tabOpenHistory(firstLine: number, lastLine: number) {
    const histories = await this.listBuffer.getRangeModels(firstLine, lastLine);
    for (const history of histories) {
      if (history.url === undefined) {
        return;
      }

      await this.tabRepository.tabOpen(history.url);
    }
  }
}
