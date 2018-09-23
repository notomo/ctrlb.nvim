import { Ctrlb } from "./ctrlb";
import { Neovim } from "neovim";
import { Requester } from "./requester";
import { ArgParser } from "./info";
import { LayoutParser, LayoutItem } from "./layout";
import { Buffers } from "./buffers";

describe("Ctrlb", () => {
  let ctrlb: Ctrlb;
  let parse: jest.Mock;
  let parseBufferOpenArg: jest.Mock;
  let layoutParse: jest.Mock;
  let executeAsync: jest.Mock;
  let openLayout: jest.Mock;

  beforeEach(() => {
    executeAsync = jest.fn();
    const RequesterClass = jest.fn<Requester>(() => ({
      executeAsync: executeAsync,
    }));
    const requester = new RequesterClass();

    parse = jest.fn();
    parseBufferOpenArg = jest.fn();
    const ArgParserClass = jest.fn<ArgParser>(() => ({
      parse: parse,
      parseBufferOpenArg: parseBufferOpenArg,
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
    const layoutParser = new LayoutParserClass();

    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const vim = new NeovimClass();

    const BuffersClass = jest.fn<Buffers>(() => ({}));
    const buffers = new BuffersClass(vim, requester);

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
});
