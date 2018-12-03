import { Neovim } from "neovim";

export class BufferRepository {
  constructor(protected readonly vim: Neovim) {}

  public async verticalOpen(id: number): Promise<void> {
    await this.vim.command("rightbelow split #" + id);
  }

  public async horizontalOpen(id: number): Promise<void> {
    await this.vim.command("rightbelow vsplit #" + id);
  }

  public async tabOpen(id: number): Promise<void> {
    await this.vim.command("tabedit #" + id);
  }

  public async open(id: number): Promise<void> {
    await this.vim.command("buffer " + id);
  }

  public async delete(id: number): Promise<void> {
    await this.vim.command("bwipeout " + id);
  }

  public async getBufferIdsOnCurrentTab(): Promise<number[]> {
    return await this.vim.call("tabpagebuflist");
  }
}
