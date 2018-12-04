import { Execute } from "./execute";
import { Action } from "./source/action";
import { ActionArgKey } from "./source/actionArgKey";

describe("Execute", () => {
  let execute: Execute;
  let getActions: jest.Mock;
  let getActionArgKeys: jest.Mock;

  beforeEach(() => {
    getActions = jest.fn().mockReturnValue(["name"]);
    const ActionClass = jest.fn<Action>(() => ({
      get: getActions,
    }));
    const action = new ActionClass();

    getActionArgKeys = jest.fn().mockReturnValue(["-zoomFactor=", "-id="]);
    const ActionArgKeyClass = jest.fn<ActionArgKey>(() => ({
      get: getActionArgKeys,
    }));
    const actionArgKey = new ActionArgKeyClass();

    execute = new Execute(action, actionArgKey);
  });

  it("findCandidates returns actions", async () => {
    const result = await execute.findCandidates("tab/", ["tab/"]);

    expect(result).toEqual(["name"]);
  });

  it("findCandidates returns parameters", async () => {
    const result = await execute.findCandidates("", ["tab/zoom/set", "-id=1"]);

    expect(result).toEqual(["-zoomFactor="]);
  });
});
