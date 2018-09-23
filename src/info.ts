import { readFileSync } from "fs";
import { CtrlbBufferType } from "./buffers/type";

export interface ActionInfo {
  actionGroupName: string;
  actionName: string;
  args?: ActionArgs;
}

enum BufferOpenOption {
  jsonFile = "json-file",
  json = "json",
}

export class ArgParser {
  protected readonly bufferOpenOptionHandlers: BufferOpenOptionHandler;
  constructor() {
    this.bufferOpenOptionHandlers = {
      [BufferOpenOption.jsonFile]: (filePath: string) => {
        const content = readFileSync(filePath);
        const json = JSON.parse(content.toString());
        return json;
      },
      [BufferOpenOption.json]: (jsonString: string) => {
        const json = JSON.parse(jsonString);
        return json;
      },
    };
  }

  public parse(arg: string): ActionInfo {
    let actionGroupName = "";
    let actionName = "";
    let actionArgs: ActionArgs = {};

    for (const value of arg.split(" ")) {
      if (!value.startsWith("-")) {
        if (!value.includes(":")) {
          throw new Error("Not found actionName.");
        }

        const names = value.split(":");
        actionGroupName = names[0];
        actionName = names[1];
        continue;
      }

      if (!value.includes("=")) {
        const key = this.parseArgKey(value);
        actionArgs[key] = true;
        continue;
      }

      const argKeyValue = value.split("=");
      const argKey = this.parseArgKey(argKeyValue[0]);
      const argValue = this.convertValue(argKeyValue[1]);

      actionArgs[argKey] = argValue;
    }
    return {
      actionGroupName: actionGroupName,
      actionName: actionName,
      args: actionArgs,
    };
  }

  protected parseArgKey(value: string): string {
    const key = value.slice(1);
    if (key.length === 0) {
      throw new Error("Arg key must not be empty.");
    }
    return key;
  }

  protected convertValue(
    value: string | number | boolean
  ): string | number | boolean {
    const v = value.toString();
    if (this.isNumber(v) || this.isFloat(v)) {
      return Number(v);
    }
    return v;
  }

  protected isNumber(value: string): boolean {
    return ((n: number) => !isNaN(n))(Number(value));
  }

  protected isFloat(value: string): boolean {
    return this.isNumber(value.replace(".", "1"));
  }

  public isBufferType(value: string): value is CtrlbBufferType {
    return value in CtrlbBufferType;
  }

  public parseBufferOpenArg(arg: string): {} {
    for (const value of arg.split(" ")) {
      if (!value.startsWith("-")) {
        continue;
      }

      const optionKeyValue = value.split("=");
      const optionKey = this.parseArgKey(optionKeyValue[0]);
      return this.bufferOpenOptionHandlers[optionKey](optionKeyValue[1]);
    }

    return {};
  }
}

type BufferOpenOptionHandler = {
  [P in BufferOpenOption]: (value: string) => any
} & {
  [index: string]: (value: string) => any;
};

type ActionArgs = {
  [index: string]: string | number | boolean | null;
};
