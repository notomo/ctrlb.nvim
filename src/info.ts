export interface ActionInfo {
  actionGroupName: string;
  actionName: string;
  args?: ActionArgs;
}

export interface BufferOpenInfo {
  name: string;
  direction: Direction;
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

  public parseBufferOpenArg(arg: string): BufferOpenInfo[] {
    let direction: Direction = Direction.VERTICAL;
    const infos: BufferOpenInfo[] = [];
    for (const value of arg.split(" ")) {
      if (!value.startsWith("-")) {
        infos.push({
          name: value,
          direction: direction,
        });
        continue;
      }

      const optionValue = value.slice(1);
      const directionValue = this.toDirectionTransform(optionValue);
      if (this.isDirection(directionValue)) {
        direction = directionValue;
        continue;
      }
    }

    if (infos.length >= 2) {
      infos.slice(-1)[0].direction = Direction.NOTHING;
    }

    return infos;
  }

  protected toDirectionTransform(value: string): string {
    return value.toUpperCase();
  }

  protected isDirection(value: string): value is Direction {
    return value in Direction;
  }
}

type ActionArgs = {
  [index: string]: string | number | boolean | null;
};

export enum Direction {
  VERTICAL = "VERTICAL",
  HORIZONTAL = "HORIZONTAL",
  NOTHING = "NOTHING",
}
