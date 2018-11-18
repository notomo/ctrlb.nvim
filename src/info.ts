import { readFileSync } from "fs";
import { CtrlbBufferType } from "./buffers/type";

export interface ActionInfo {
  method: string;
  params?: ActionArgs;
}

export class ArgParser {
  protected readonly separator = "/";

  public parse(arg: string): ActionInfo {
    let method = "";
    let actionArgs: ActionArgs = {};

    for (const value of arg.split(" ")) {
      if (!value.startsWith("-")) {
        if (!value.includes(this.separator)) {
          throw new Error("Not found actionName.");
        }

        method = value;
        continue;
      }

      if (!value.includes("=")) {
        const key = this.parseArgKey(value);
        actionArgs[key] = true;
        continue;
      }

      const equalIndex = value.indexOf("=");
      const argKey = this.parseArgKey(value.slice(0, equalIndex));
      const argValue = this.convertValue(value.slice(equalIndex + 1));

      actionArgs[argKey] = argValue;
    }
    return {
      method: method,
      params: actionArgs,
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

  public parseJsonFile(jsonFilePath: string): {} {
    const content = readFileSync(jsonFilePath);
    const json = JSON.parse(content.toString());
    return json;
  }
}

type ActionArgs = {
  [index: string]: string | number | boolean | null;
};
