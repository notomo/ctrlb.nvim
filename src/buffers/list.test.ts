import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { ListBuffer } from "./list";
import { BufferOptionStore } from "./option";

class ExampleItem {
  public value = "value";

  public toString(): string {
    return this.value;
  }
}

describe("ListBuffer", () => {
  let listBuffer: ListBuffer<string>;
  let bufferOptionStore: BufferOptionStore;

  let get: jest.Mock;
  let getOptionStore: jest.Mock;
  let isDisplayed: jest.Mock;

  let call: jest.Mock;
  let command: jest.Mock;

  let insert: jest.Mock;

  let set: jest.Mock;

  beforeEach(() => {
    call = jest.fn().mockReturnValue(1);
    command = jest.fn();
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({
      call: call,
      command: command,
    })) as any;
    const vim = new NeovimClass();

    insert = jest.fn();
    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      insert: insert,
    })) as any;
    const buffer = new BufferClass();

    set = jest.fn();
    const BufferOptionStoreClass: jest.Mock<BufferOptionStore> = jest.fn(
      () => ({
        set: set,
      })
    ) as any;
    bufferOptionStore = new BufferOptionStoreClass();

    get = jest.fn().mockReturnValue(buffer);
    getOptionStore = jest.fn().mockReturnValue(bufferOptionStore);
    isDisplayed = jest.fn().mockReturnValue(true);
    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(() => ({
      get: get,
      getOptionStore: getOptionStore,
      isDisplayed: isDisplayed,
    })) as any;
    const bufferContainer = new BufferContainerClass();

    listBuffer = new ListBuffer(vim, bufferContainer);
  });

  it("getModel returns null when the index is out of the range", async () => {
    const model = await listBuffer.getModel(3);
    expect(model).toEqual(null);
  });

  it("getModel", async () => {
    const model = await listBuffer.getModel(3);
    expect(model).toEqual(null);
  });

  it("prepend", async () => {
    const item = new ExampleItem();

    await listBuffer.prepend(item);

    const current = await listBuffer.getCurrent();
    const rangeModels = await listBuffer.getRangeModels(1, 1);

    expect(item.value).toEqual(current);
    expect([item.value]).toEqual(rangeModels);
  });
});
