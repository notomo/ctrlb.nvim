import { Execute } from "./execute";
import { ActionGroup } from "./source/actionGroup";
import { ActionName } from "./source/actionName";
import { ActionArgKey } from "./source/actionArgKey";

describe("Execute", () => {
  let execute: Execute;
  let getActionGroups: jest.Mock;
  let getActions: jest.Mock;
  let getActionArgs: jest.Mock;

  beforeEach(() => {
    getActionGroups = jest.fn();
    const ActionGroupClass = jest.fn<ActionGroup>(() => ({
      get: getActionGroups,
    }));
    const actionGroup = new ActionGroupClass();

    getActions = jest.fn().mockReturnValue(["name"]);
    const ActionNameClass = jest.fn<ActionName>(() => ({
      get: getActions,
    }));
    const actionName = new ActionNameClass();

    getActionArgs = jest.fn();
    const ActionArgKeyClass = jest.fn<ActionArgKey>(() => ({
      get: getActionArgs,
    }));
    const actionArgKey = new ActionArgKeyClass();

    execute = new Execute(actionGroup, actionName, actionArgKey);
  });

  it("findCandidates returns actionGroups", async () => {
    await execute.findCandidates("", []);
    expect(getActionGroups).toHaveBeenCalled();
  });

  it("findCandidates returns actions", async () => {
    await execute.findCandidates("tab:", ["tab:"]);
    expect(getActions).toHaveBeenCalled();
  });

  it("findCandidates returns actionArgs", async () => {
    await execute.findCandidates("", ["tab:actionName"]);
    expect(getActionArgs).toHaveBeenCalled();
  });
});
