import { BaseBuffer } from "./base";
import { Neovim, Buffer } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { HistoryRepository, History } from "../repository/history";
import { TabRepository } from "../repository/tab";
import { EventRepository } from "../repository/event";

export class HistoryList extends BaseBuffer {
  public readonly type = CtrlbBufferType.historyList;

  protected histories: History[] = [];

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly eventRepository: EventRepository,
    protected readonly historyRepository: HistoryRepository,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRepository);
  }

  protected async setup(buffer: Buffer): Promise<void> {
    this.actions["tabOpen"] = (buffer: Buffer) => this.tabOpenHistory(buffer);
    this.actions["open"] = (buffer: Buffer) => this.openHistory(buffer);

    await buffer.setOption("buftype", "nofile");
    await buffer.setOption("swapfile", false);
    await buffer.setOption("buflisted", true);
    await buffer.setOption("modifiable", true);

    await this.vim.command(
      "highlight default link CtrlbHistoryListUrl Underlined"
    );
    await this.vim.command(
      "syntax match CtrlbHistoryListUrl /[[:tab:]]\\zs.*$/"
    );

    this.subscribe("historyCreated");

    const p = this.historyRepository.onCreated(history =>
      this.update(history, buffer)
    );
    this.receivers.push(p);

    await this.create(buffer);
  }

  protected async create(buffer: Buffer) {
    const histories = await this.historyRepository.search();

    const lines = histories.map(history => {
      return history.title + "\t" + history.url;
    });
    await buffer.replace(lines, 0);

    this.histories = histories;
  }

  protected async getCurrent(): Promise<History | null> {
    const index = (await this.vim.call("line", ".")) - 1;
    if (index in this.histories) {
      return this.histories[index];
    }
    return null;
  }

  protected async update(history: History, buffer: Buffer) {
    await buffer.insert(history.title + "\t" + history.url, 0);
    this.histories.unshift(history);
  }

  public async openHistory(buffer: Buffer) {
    const history = await this.getCurrent();
    if (history === null || history.url === undefined) {
      return;
    }

    await this.tabRepository.open(history.url);
  }

  public async tabOpenHistory(buffer: Buffer) {
    const history = await this.getCurrent();
    if (history === null || history.url === undefined) {
      return;
    }

    await this.tabRepository.tabOpen(history.url);
  }
}
