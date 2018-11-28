import { Requester } from "../requester";
import { ApiInfoRepository } from "./apiInfo";

describe("ApiInfoRepository", () => {
  let execute: jest.Mock;

  it("get", async () => {
    execute = jest.fn().mockReturnValue([[], null]);
    const RequesterClass = jest.fn<Requester>(() => ({
      execute: execute,
    }));
    const requester = new RequesterClass();

    const apiInfoRepository = new ApiInfoRepository(requester);
    const result = await apiInfoRepository.get();

    expect(execute).toHaveBeenCalledWith({
      method: "apiInfo/get",
    });

    expect(result).toEqual([[], null]);
  });
});
