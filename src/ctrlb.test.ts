import { Ctrlb } from "./ctrlb";
import { Requester } from "./requester";
import { ArgParser } from "./info";

describe("Ctrlb", () => {
  let ctrlb: Ctrlb;
  let parse: jest.Mock;
  let executeAsync: jest.Mock;

  beforeEach(() => {
    executeAsync = jest.fn();
    const RequesterClass = jest.fn<Requester>(() => ({
      executeAsync: executeAsync,
    }));
    const requester = new RequesterClass();

    parse = jest.fn();
    const ArgParserClass = jest.fn<ArgParser>(() => ({
      parse: parse,
    }));
    const argParser = new ArgParserClass();

    ctrlb = new Ctrlb(requester, argParser);
  });

  it("requestAsync", () => {
    const arg = "";
    const info = {};
    parse.mockReturnValue(info);

    ctrlb.requestAsync(arg);

    expect(parse).toHaveBeenCalledWith(arg);
    expect(executeAsync).toHaveBeenCalledWith(info);
  });
});
