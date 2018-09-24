import { Ctrlb } from "./ctrlb";
import { Neovim } from "neovim";
import { Requester } from "./requester";
import { ArgParser } from "./info";
import { LayoutParser, LayoutItem } from "./layout";
import { Buffers } from "./buffers";
import { BaseBuffer } from "./buffers/base";

describe("Ctrlb", () => {
  let ctrlb: Ctrlb;
  let parse: jest.Mock;
  let parseBufferOpenArg: jest.Mock;
  let isBufferType: jest.Mock;
  let layoutParse: jest.Mock;
  let executeAsync: jest.Mock;
  let openLayout: jest.Mock;
  let get: jest.Mock;
  let doAction: jest.Mock;
  let layoutParser: LayoutParser;
  let requester: Requester;
  let buffers: Buffers;

  beforeEach(() => {
    executeAsync = jest.fn();
    const RequesterClass = jest.fn<Requester>(() => ({
      executeAsync: executeAsync,
    }));
    requester = new RequesterClass();

    parse = jest.fn();
    parseBufferOpenArg = jest.fn();
    isBufferType = jest.fn().mockReturnValue(true);
    const ArgParserClass = jest.fn<ArgParser>(() => ({
      parse: parse,
      parseBufferOpenArg: parseBufferOpenArg,
      isBufferType: isBufferType,
    }));
    const argParser = new ArgParserClass();

    openLayout = jest.fn();
    const LayoutItemClass = jest.fn<LayoutItem>(() => ({
      openLayout: openLayout,
    }));
    const layoutItem = new LayoutItemClass();

    layoutParse = jest.fn();
    layoutParse.mockReturnValue(layoutItem);
    const LayoutParserClass = jest.fn<LayoutParser>(() => ({
      parse: layoutParse,
    }));
    layoutParser = new LayoutParserClass();

    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const vim = new NeovimClass();

    doAction = jest.fn();
    const BaseBufferClass = jest.fn<BaseBuffer>(() => ({
      doAction: doAction,
    }));
    const buffer = new BaseBufferClass();

    get = jest.fn().mockReturnValue(buffer);
    const BuffersClass = jest.fn<Buffers>(() => ({
      get: get,
    }));
    buffers = new BuffersClass(vim, requester);

    ctrlb = new Ctrlb(requester, argParser, layoutParser, buffers);
  });

  it("requestAsync", async () => {
    const arg = "";
    const info = {};
    parse.mockReturnValue(info);

    await ctrlb.requestAsync(arg);

    expect(parse).toHaveBeenCalledWith(arg);
    expect(executeAsync).toHaveBeenCalledWith(info);
  });

  it("open", async () => {
    const arg = "";
    const info = {};
    parseBufferOpenArg.mockReturnValue(info);

    await ctrlb.open(arg);

    expect(parseBufferOpenArg).toHaveBeenCalledWith(arg);
    expect(layoutParse).toHaveBeenCalledWith(info);
    expect(openLayout).toHaveBeenCalled();
  });

  it("doAction", async () => {
    const bufferType = "bufferType";
    await ctrlb.doAction(bufferType, "actionName");
  });

  it("doAction throws error if bufferType is invalid", () => {
    const bufferType = "invalidBufferType";
    isBufferType = jest.fn().mockReturnValue(false);
    const ArgParserClass = jest.fn<ArgParser>(() => ({
      isBufferType: isBufferType,
    }));
    const argParser = new ArgParserClass();
    ctrlb = new Ctrlb(requester, argParser, layoutParser, buffers);

    expect(ctrlb.doAction(bufferType, "actionName")).rejects.toEqual(
      new Error("Inavalid bufferType: " + bufferType)
    );
  });
});
