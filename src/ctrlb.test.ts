import { Ctrlb } from "./ctrlb";
import { Requester } from "./requester";
import { ArgParser } from "./info";
import { BufferOpener } from "./buffer";

describe("Ctrlb", () => {
  let ctrlb: Ctrlb;
  let parse: jest.Mock;
  let parseBufferOpenArg: jest.Mock;
  let open: jest.Mock;
  let executeAsync: jest.Mock;

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

    open = jest.fn();
    const BufferOpenerClass = jest.fn<BufferOpener>(() => ({
      open: open,
    }));
    const bufferOpener = new BufferOpenerClass();

    ctrlb = new Ctrlb(requester, argParser, bufferOpener);
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
    expect(open).toHaveBeenCalledWith(info);
  });
});
