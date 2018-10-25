import { BaseBuffer } from "./base";
import { Neovim, Buffer } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { ListBuffer } from "./list";
import { HistoryRepository, History } from "../repository/history";
import { TabRepository } from "../repository/tab";
import { EventRepository } from "../repository/event";

class HistoryListItem {
  constructor(protected readonly history: History) {}

  public toString(): string {
    return this.history.title + "\t" + this.history.url;
  }

  public toValue(): History {
    return this.history;
  }
}

export class HistoryList extends BaseBuffer {
  public static readonly type = CtrlbBufferType.historyList;

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly listBuffer: ListBuffer<History>,
    protected readonly eventRepository: EventRepository,
    protected readonly historyRepository: HistoryRepository,
    protected readonly tabRepository: TabRepository
  ) {
    super(vim, bufferContainer, eventRepository);
  }

  protected async setup(buffer: Buffer): Promise<void> {
    this.actions["tabOpen"] = (buffer: Buffer) => this.tabOpenHistory();
    this.actions["open"] = (buffer: Buffer) => this.openHistory();

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

    const p = this.historyRepository.onCreated(history => this.update(history));
    this.receivers.push(p);

    const items = (await this.historyRepository.search()).map(history => {
      return new HistoryListItem(history);
    });
    await this.listBuffer.set(items);
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

  public async tabOpenHistory() {
    const history = await this.listBuffer.getCurrent();
    if (history === null || history.url === undefined) {
      return;
    }

    await this.tabRepository.tabOpen(history.url);
  }
}
