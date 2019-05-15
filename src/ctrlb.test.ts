import { Ctrlb } from "./ctrlb";
import { Neovim } from "neovim";
import { Requester } from "./requester";
import { Completer } from "./complete";
import { ArgParser } from "./info";
import { LayoutParser, LayoutItem } from "./layout";
import { Buffers } from "./buffers";
import { BaseBuffer } from "./buffers/base";

describe("Ctrlb", () => {
  let ctrlb: Ctrlb;
  let parse: jest.Mock;
  let parseJsonFile: jest.Mock;
  let isBufferType: jest.Mock;
  let layoutParse: jest.Mock;
  let executeAsync: jest.Mock;
  let openLayout: jest.Mock;
  let get: jest.Mock;
  let clearAll: jest.Mock;
  let doAction: jest.Mock;
  let open: jest.Mock;
  let layoutParser: LayoutParser;
  let requester: Requester;
  let buffers: Buffers;
  let completer: Completer;
  let complete: jest.Mock;

  beforeEach(() => {
    executeAsync = jest.fn();
    const RequesterClass: jest.Mock<Requester> = jest.fn(() => ({
      executeAsync: executeAsync,
    })) as any;
    requester = new RequesterClass();

    complete = jest.fn();
    const CompleterClass: jest.Mock<Completer> = jest.fn(() => ({
      complete: complete,
    })) as any;
    completer = new CompleterClass(requester);

    parse = jest.fn();
    parseJsonFile = jest.fn();
    isBufferType = jest.fn().mockReturnValue(true);
    const ArgParserClass: jest.Mock<ArgParser> = jest.fn(() => ({
      parse: parse,
      parseJsonFile: parseJsonFile,
      isBufferType: isBufferType,
    })) as any;
    const argParser = new ArgParserClass();

    openLayout = jest.fn();
    const LayoutItemClass: jest.Mock<LayoutItem> = jest.fn(() => ({
      openLayout: openLayout,
    })) as any;
    const layoutItem = new LayoutItemClass();

    layoutParse = jest.fn();
    layoutParse.mockReturnValue(layoutItem);
    const LayoutParserClass: jest.Mock<LayoutParser> = jest.fn(() => ({
      parse: layoutParse,
    })) as any;
    layoutParser = new LayoutParserClass();

    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    const vim = new NeovimClass();

    doAction = jest.fn();
    open = jest.fn();
    const BaseBufferClass: jest.Mock<BaseBuffer> = jest.fn(() => ({
      doAction: doAction,
      open: open,
    })) as any;
    const buffer = new BaseBufferClass();

    get = jest.fn().mockReturnValue(buffer);
    clearAll = jest.fn().mockReturnValue(buffer);
    const BuffersClass: jest.Mock<Buffers> = jest.fn(() => ({
      get: get,
      clearAll: clearAll,
    })) as any;
    buffers = new BuffersClass(vim, requester);

    ctrlb = new Ctrlb(requester, argParser, layoutParser, buffers, completer);
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
    const bufferType = "bufferType";
    await ctrlb.open(bufferType);

    expect(open).toHaveBeenCalled();
  });

  it("open throws error if bufferType is invalid", () => {
    const bufferType = "invalidBufferType";
    isBufferType = jest.fn().mockReturnValue(false);
    const ArgParserClass: jest.Mock<ArgParser> = jest.fn(() => ({
      isBufferType: isBufferType,
    })) as any;
    const argParser = new ArgParserClass();
    ctrlb = new Ctrlb(requester, argParser, layoutParser, buffers, completer);

    expect(ctrlb.open(bufferType)).rejects.toEqual(
      new Error("Inavalid bufferType: " + bufferType)
    );
  });

  it("openLayout", async () => {
    const jsonFilePath = "jsonFilePath";
    const info = {};
    parseJsonFile.mockReturnValue(info);

    await ctrlb.openLayout(jsonFilePath);

    expect(parseJsonFile).toHaveBeenCalledWith(jsonFilePath);
    expect(layoutParse).toHaveBeenCalledWith(info, null);
    expect(openLayout).toHaveBeenCalled();
  });

  it("doAction", async () => {
    const bufferType = "bufferType";
    await ctrlb.doAction(bufferType, "actionName", 1, 1);
  });

  it("doAction throws error if bufferType is invalid", () => {
    const bufferType = "invalidBufferType";
    isBufferType = jest.fn().mockReturnValue(false);
    const ArgParserClass: jest.Mock<ArgParser> = jest.fn(() => ({
      isBufferType: isBufferType,
    })) as any;
    const argParser = new ArgParserClass();
    ctrlb = new Ctrlb(requester, argParser, layoutParser, buffers, completer);

    expect(ctrlb.doAction(bufferType, "actionName", 1, 1)).rejects.toEqual(
      new Error("Inavalid bufferType: " + bufferType)
    );
  });

  it("clearAll", async () => {
    await ctrlb.clearAll();
    expect(clearAll).toHaveBeenCalledTimes(1);
  });

  it("complete", async () => {
    await ctrlb.complete("", "", 1);
    expect(complete).toHaveBeenCalledTimes(1);
  });
});
