import { Action } from "./action";
import { ApiInfoRepository } from "../../repository/apiInfo";

describe("Action", () => {
  let get: jest.Mock;
  let action: Action;

  beforeEach(() => {
    get = jest.fn().mockReturnValue({
      actionGroups: [{ name: "tab", actions: [{ name: "next" }] }],
    });
    const ApiInfoRepositoryClass = jest.fn<ApiInfoRepository>(() => ({
      get: get,
    }));
    const apiInfoRepository = new ApiInfoRepositoryClass();

    action = new Action(apiInfoRepository);
  });

  it("get returns empty array if actionGroupName is invalid", async () => {
    const result = await action.get("");
    expect(result).toEqual([]);
  });

  it("get", async () => {
    const result = await action.get("tab");
    expect(result).toEqual(["next"]);
  });
});
