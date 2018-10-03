import { BaseBuffer } from "./base";
import { Buffer } from "neovim";
import { CtrlbBufferType } from "./type";

type History = {
  title: string;
  url: string;
};

export class HistoryList extends BaseBuffer {
  public readonly type = CtrlbBufferType.historyList;

  protected histories: History[] = [];

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

    const p = this.requester.receiveAsyncOnEvent<History>(
      {},
      { option: { eventName: "historyCreated" } },
      history => this.update(history, buffer)
    );
    this.receivers.push(p);

    await this.create(buffer);
  }

  protected async create(buffer: Buffer) {
    const histories = await this.requester.execute<History[]>({
      actionGroupName: "history",
      actionName: "search",
      args: {},
    });

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

    await this.requester.executeAsync({
      actionGroupName: "tab",
      actionName: "open",
      args: { url: history.url },
    });
  }

  public async tabOpenHistory(buffer: Buffer) {
    const history = await this.getCurrent();
    if (history === null || history.url === undefined) {
      return;
    }

    await this.requester.executeAsync({
      actionGroupName: "tab",
      actionName: "tabOpen",
      args: { url: history.url },
    });
  }
}
