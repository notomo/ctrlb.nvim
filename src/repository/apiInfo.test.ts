import { Requester } from "../requester";
import { ApiInfoRepository } from "./apiInfo";

describe("ApiInfoRepository", () => {
  let execute: jest.Mock;

  it("get", () => {
    execute = jest.fn();
    const RequesterClass = jest.fn<Requester>(() => ({
      execute: execute,
    }));
    const requester = new RequesterClass();

    const apiInfoRepository = new ApiInfoRepository(requester);
    apiInfoRepository.get();

    expect(execute).toHaveBeenCalledWith({
      actionGroupName: "apiInfo",
      actionName: "get",
    });
  });
});
