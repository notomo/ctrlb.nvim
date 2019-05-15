import { Neovim } from "neovim";
import { BufferContainer } from "./container";
import { ItemBuffer } from "./item";

class ExampleItem {
  public value = "value";

  public toStrings(): string[] {
    return [this.value];
  }
}

describe("ItemBuffer", () => {
  let itemBuffer: ItemBuffer<string>;

  let get: jest.Mock;
  let isDisplayed: jest.Mock;

  let replace: jest.Mock;

  beforeEach(() => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    const vim = new NeovimClass();

    replace = jest.fn();
    const BufferClass: jest.Mock<Buffer> = jest.fn(() => ({
      replace: replace,
    })) as any;
    const buffer = new BufferClass();

    get = jest.fn().mockReturnValue(buffer);
    isDisplayed = jest.fn().mockReturnValue(true);
    const BufferContainerClass: jest.Mock<BufferContainer> = jest.fn(() => ({
      get: get,
      isDisplayed: isDisplayed,
    })) as any;
    const bufferContainer = new BufferContainerClass();

    itemBuffer = new ItemBuffer(vim, bufferContainer);
  });

  it("getCurrent returns null when an item is not set", async () => {
    const result = await itemBuffer.getCurrent();
    expect(result).toEqual(null);
  });

  it("set and getCurrent", async () => {
    const item = new ExampleItem();

    await itemBuffer.set(item);

    const result = await itemBuffer.getCurrent();
    expect(result).toEqual("value");
  });
});
