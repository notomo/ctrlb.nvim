import { Ctrlb } from "./ctrlb";
import { ArgParser } from "./info";
import { Requester } from "./requester";
import { LayoutParser } from "./layout";
import { Completer } from "./complete";
import { Buffers } from "./buffers";
import { Neovim } from "neovim";
import { getLogger } from "./logger";
import { Reporter } from "./reporter";
import { BufferType } from "./complete/source/bufferType";
import { ActionGroup } from "./complete/source/actionGroup";
import { ActionName } from "./complete/source/actionName";
import { ActionArgKey } from "./complete/source/actionArgKey";
import { ApiInfoRepository } from "./repository/apiInfo";
import { Execute } from "./complete/execute";
import { Open } from "./complete/open";

export class Di {
  protected static readonly deps: Deps = {
    Ctrlb: (vim: Neovim) => {
      const argParser = new ArgParser();
      const requester = Di.get("Requester", vim);
      const buffers = new Buffers(vim, requester);
      const layoutParser = new LayoutParser(vim, buffers);
      const completer = Di.get("Completer", vim);
      return new Ctrlb(requester, argParser, layoutParser, buffers, completer);
    },
    Requester: (vim: Neovim) => {
      return new Requester();
    },
    Reporter: (vim: Neovim) => {
      const logger = getLogger("index");
      return new Reporter(vim, logger);
    },
    Completer: (vim: Neovim) => {
      const open = Di.get("Open", vim);
      const execute = Di.get("Execute", vim);
      return new Completer(open, execute);
    },
    ApiInfoRepository: (vim: Neovim) => {
      const requester = Di.get("Requester", vim);
      return new ApiInfoRepository(requester);
    },
    Open: (vim: Neovim) => {
      const bufferType = new BufferType();
      return new Open(bufferType);
    },
    Execute: (vim: Neovim) => {
      const apiInfoRepository = Di.get("ApiInfoRepository", vim);
      const actionGroup = new ActionGroup(apiInfoRepository);
      const actionName = new ActionName(apiInfoRepository);
      const actionArgKey = new ActionArgKey();
      return new Execute(actionGroup, actionName, actionArgKey);
    },
  };

  protected static readonly cache: DepsCache = {
    Ctrlb: null,
    Requester: null,
    Reporter: null,
    Open: null,
    Execute: null,
    Completer: null,
    ApiInfoRepository: null,
  };

  public static get(cls: "ApiInfoRepository", vim: Neovim): ApiInfoRepository;
  public static get(cls: "Execute", vim: Neovim): Execute;
  public static get(cls: "Open", vim: Neovim): Open;
  public static get(cls: "Completer", vim: Neovim): Completer;
  public static get(cls: "Reporter", vim: Neovim): Reporter;
  public static get(cls: "Requester", vim: Neovim): Requester;
  public static get(cls: "Ctrlb", vim: Neovim): Ctrlb;
  public static get(
    cls: keyof Deps,
    vim: Neovim
  ): ReturnType<Deps[keyof Deps]> {
    const cache = this.cache[cls];
    if (cache !== null) {
      return cache;
    }
    const resolved = this.deps[cls](vim);
    this.cache[cls] = resolved;
    return resolved;
  }

  public static set(
    cls: keyof Deps,
    value: ReturnType<Deps[keyof Deps]>
  ): void {
    this.cache[cls] = value;
  }

  public static clear(): void {
    for (const key of Object.keys(this.deps)) {
      this.cache[key as keyof DepsCache] = null;
    }
  }
}

interface Deps {
  Ctrlb: { (vim: Neovim): Ctrlb };
  Requester: { (vim: Neovim): Requester };
  Reporter: { (vim: Neovim): Reporter };
  Open: { (vim: Neovim): Open };
  Execute: { (vim: Neovim): Execute };
  Completer: { (vim: Neovim): Completer };
  ApiInfoRepository: { (vim: Neovim): ApiInfoRepository };
}

type DepsCache = { [P in keyof Deps]: ReturnType<Deps[P]> | null };
