import { ActionName } from "./actionName";
import { ApiInfoRepository } from "../../repository/apiInfo";

describe("ActionName", () => {
  let get: jest.Mock;
  let actionName: ActionName;

  beforeEach(() => {
    get = jest.fn().mockReturnValue({
      actionGroups: [{ name: "tab", actions: [{ name: "next" }] }],
    });
    const ApiInfoRepositoryClass = jest.fn<ApiInfoRepository>(() => ({
      get: get,
    }));
    const apiInfoRepository = new ApiInfoRepositoryClass();

    actionName = new ActionName(apiInfoRepository);
  });

  it("get returns empty array if actionGroupName is invalid", async () => {
    const result = await actionName.get("");
    expect(result).toEqual([]);
  });

  it("get", async () => {
    const result = await actionName.get("tab");
    expect(result).toEqual(["next"]);
  });
});
