import { ActionArgKey } from "./actionArgKey";
import { ApiInfoRepository } from "../../repository/apiInfo";

describe("actionArgKey", () => {
  let get: jest.Mock;
  let actionArgKey: ActionArgKey;

  beforeEach(() => {
    get = jest
      .fn()
      .mockReturnValue([
        [{ name: "tab/open", params: [{ name: "url" }] }],
        null,
      ]);
    const ApiInfoRepositoryClass = jest.fn<ApiInfoRepository>(() => ({
      get: get,
    }));
    const apiInfoRepository = new ApiInfoRepositoryClass();

    actionArgKey = new ActionArgKey(apiInfoRepository);
  });

  it("get", async () => {
    const result = await actionArgKey.get("tab/open");

    expect(result).toEqual(["-url="]);
  });

  it("get empty", async () => {
    const result = await actionArgKey.get("notExistsActionName");

    expect(result).toEqual([]);
  });

  it("get error", async () => {
    get = jest.fn().mockReturnValue([[], { name: "error" }]);
    const ApiInfoRepositoryClass = jest.fn<ApiInfoRepository>(() => ({
      get: get,
    }));
    const apiInfoRepository = new ApiInfoRepositoryClass();

    actionArgKey = new ActionArgKey(apiInfoRepository);

    const result = await actionArgKey.get("tab/open");

    expect(result).toEqual([]);
  });
});
