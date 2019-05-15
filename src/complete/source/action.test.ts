import { Action } from "./action";
import { ApiInfoRepository } from "../../repository/apiInfo";

describe("Action", () => {
  let get: jest.Mock;
  let action: Action;

  beforeEach(() => {
    get = jest.fn().mockReturnValue([[{ name: "tab/next" }], null]);
    const ApiInfoRepositoryClass: jest.Mock<ApiInfoRepository> = jest.fn(
      () => ({
        get: get,
      })
    ) as any;
    const apiInfoRepository = new ApiInfoRepositoryClass();

    action = new Action(apiInfoRepository);
  });

  it("get", async () => {
    const result = await action.get("tab");
    expect(result).toEqual(["tab/next"]);
  });

  it("get error", async () => {
    get = jest.fn().mockReturnValue([[], { name: "error" }]);
    const ApiInfoRepositoryClass: jest.Mock<ApiInfoRepository> = jest.fn(
      () => ({
        get: get,
      })
    ) as any;
    const apiInfoRepository = new ApiInfoRepositoryClass();

    action = new Action(apiInfoRepository);

    const result = await action.get("tab");

    expect(result).toEqual([]);
  });
});
