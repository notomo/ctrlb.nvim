import { Completer } from "./index";
import { Open } from "./open";
import { Execute } from "./execute";

describe("Completer", () => {
  let completer: Completer;
  let open: Open;
  let execute: Execute;
  let matchTrue: jest.Mock;
  let matchFalse: jest.Mock;
  let findCandidates: jest.Mock;

  beforeEach(() => {
    matchFalse = jest.fn().mockReturnValue(false);
    const OpenClass = jest.fn<Open>(() => ({
      match: matchFalse,
    }));
    open = new OpenClass();

    matchTrue = jest.fn().mockReturnValue(true);
    findCandidates = jest.fn();
    const ExecuteClass = jest.fn<Execute>(() => ({
      match: matchTrue,
      findCandidates: findCandidates,
    }));
    execute = new ExecuteClass();

    completer = new Completer(open, execute);
  });

  it("complete", async () => {
    const currentArg = "empty";
    await completer.complete(currentArg, "CtrlbOpen empty", 1);

    expect(findCandidates).toHaveBeenCalledWith(currentArg, ["empty"]);
  });

  it("complete returns empty array", async () => {
    const ExecuteClass = jest.fn<Execute>(() => ({
      match: matchFalse,
    }));
    execute = new ExecuteClass();
    const completer = new Completer(open, execute);

    await completer.complete("", "", 1);

    expect(findCandidates).not.toHaveBeenCalled();
  });
});
