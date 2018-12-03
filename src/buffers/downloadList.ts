import { BaseBuffer } from "./base";
import { Neovim } from "neovim";
import { CtrlbBufferType } from "./type";
import { BufferContainer } from "./container";
import { ListBuffer } from "./list";
import { DownloadRepository, Download } from "../repository/download";
import { EventRegisterer } from "./event";

export class DownloadListItem {
  constructor(protected readonly download: Download) {}

  public toString(): string {
    return this.download.filename + "\t" + this.download.url;
  }

  public get value(): Download {
    return this.download;
  }
}

export class DownloadList extends BaseBuffer {
  public static readonly type = CtrlbBufferType.downloadList;

  protected readonly options = {
    buftype: "nofile",
    buflisted: true,
    swapfile: false,
    modifiable: true,
    undolevels: -1,
  };

  constructor(
    protected readonly vim: Neovim,
    protected readonly bufferContainer: BufferContainer,
    protected readonly listBuffer: ListBuffer<Download>,
    protected readonly eventRegisterer: EventRegisterer,
    protected readonly downloadRepository: DownloadRepository
  ) {
    super(vim, bufferContainer, eventRegisterer);
    this.actions["debug"] = async () =>
      this.debug(await this.listBuffer.getCurrent());
    this.actions["read"] = () => this.read();
  }

  protected async setup(): Promise<void> {
    const p = this.downloadRepository.onCreated(download =>
      this.update(download)
    );
    this.eventRegisterer.subscribe(p);

    await this.bufferContainer.defineReadAction("read");

    this.read();
  }

  protected async read() {
    const [downloads, error] = await this.downloadRepository.search();

    if (error !== null) {
      return;
    }

    const items = downloads.map(download => {
      return new DownloadListItem(download);
    });
    await this.listBuffer.set(items);
  }

  protected async update(download: Download) {
    const item = new DownloadListItem(download);
    await this.listBuffer.prepend(item);
  }
}
