import { Neovim } from "neovim";

export class ConfigRepository {
  constructor(protected readonly vim: Neovim) {}

  public async getTimeout(): Promise<number> {
    return (await this.get("timeout")) as number;
  }

  protected async get(name: string) {
    return this.vim.call("ctrlb#config#get", name);
  }
}
