import { Execute } from "./execute";
import { Action } from "./source/action";
import { ActionArgKey } from "./source/actionArgKey";

describe("Execute", () => {
  let execute: Execute;
  let getActions: jest.Mock;
  let getActionArgKeys: jest.Mock;

  beforeEach(() => {
    getActions = jest.fn().mockReturnValue(["name"]);
    const ActionClass: jest.Mock<Action> = jest.fn(() => ({
      get: getActions,
    })) as any;
    const action = new ActionClass();

    getActionArgKeys = jest.fn().mockReturnValue(["-zoomFactor=", "-id="]);
    const ActionArgKeyClass: jest.Mock<ActionArgKey> = jest.fn(() => ({
      get: getActionArgKeys,
    })) as any;
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
