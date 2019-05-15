import { Open } from "./open";
import { BufferType } from "./source/bufferType";

describe("Open", () => {
  let get: jest.Mock;
  let open: Open;

  beforeEach(() => {
    get = jest.fn();
    const BufferTypeClass: jest.Mock<BufferType> = jest.fn(() => ({
      get: get,
    })) as any;
    const bufferTypeSource = new BufferTypeClass();
    open = new Open(bufferTypeSource);
  });

  it("findCandidates", async () => {
    await open.findCandidates("", []);

    expect(get).toHaveBeenCalled();
  });
});
