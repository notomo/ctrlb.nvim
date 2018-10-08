import { ActionGroup } from "./actionGroup";
import { ApiInfoRepository } from "../../repository/apiInfo";

describe("ActionGroup", () => {
  let actionGroup: ActionGroup;
  let get: jest.Mock;

  beforeEach(() => {
    get = jest.fn().mockReturnValue({
      actionGroups: [{ name: "actionGroup1" }, { name: "actionGroup2" }],
    });
    const ApiInfoRepositoryClass = jest.fn<ApiInfoRepository>(() => ({
      get: get,
    }));
    const apiInfoRepository = new ApiInfoRepositoryClass();

    actionGroup = new ActionGroup(apiInfoRepository);
  });

  it("get", async () => {
    const result = await actionGroup.get();

    expect(result).toEqual(["actionGroup1", "actionGroup2"]);
  });
});
