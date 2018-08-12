export interface ActionInfo {
  actionGroupName: string;
  actionName: string;
  args?: ActionArgs;
}

export class ArgParser {
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
}

type ActionArgs = {
  [index: string]: string | number | boolean | null;
};
