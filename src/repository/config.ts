import { Neovim } from "neovim";

export class ConfigRepository {
  constructor(protected readonly vim: Neovim) {}

  public async getTimeout(): Promise<number> {
    return (await this.get("timeout")) as number;
  }

  public async getPort(): Promise<number | null> {
    return (await this.get("port")) as number | null;
  }

  public async getExecutableClient(): Promise<string> {
    return (await this.get("executable_client")) as string;
  }

  protected async get(name: string) {
    return this.vim.call("ctrlb#config#get", name);
  }
}
