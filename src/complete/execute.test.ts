import { Execute } from "./execute";
import { Action } from "./source/action";
import { ActionArgKey } from "./source/actionArgKey";

describe("Execute", () => {
  let execute: Execute;
  let getActions: jest.Mock;
  let getActionArgs: jest.Mock;

  beforeEach(() => {
    getActions = jest.fn().mockReturnValue(["name"]);
    const ActionClass = jest.fn<Action>(() => ({
      get: getActions,
    }));
    const action = new ActionClass();

    getActionArgs = jest.fn();
    const ActionArgKeyClass = jest.fn<ActionArgKey>(() => ({
      get: getActionArgs,
    }));
    const actionArgKey = new ActionArgKeyClass();

    execute = new Execute(action, actionArgKey);
  });

  it("findCandidates returns actions", async () => {
    await execute.findCandidates("tab/", ["tab/"]);
    expect(getActions).toHaveBeenCalled();
  });
});
