import { Ctrl } from "./buffers/ctrl";
import { Direction } from "./direction";
import { BufferItem, LayoutParser, LayoutItem } from "./layout";
import { Neovim, Window } from "neovim";
import { Buffers } from "./buffers";
import { Requester } from "./requester";
import { BaseBuffer } from "./buffers/base";
import { Empty } from "./buffers/empty";

describe("BufferItem", () => {
  let bufferItem: BufferItem;
  let ctrl: Ctrl;
  let open: jest.Mock;

  beforeEach(() => {
    open = jest.fn();
    const CtrlClass: jest.Mock<Ctrl> = jest.fn(() => ({
      open: open,
    })) as any;
    ctrl = new CtrlClass();

    bufferItem = new BufferItem(ctrl, null, false);
  });

  it("open", async () => {
    const direction = Direction.HORIZONTAL;
    await bufferItem.open(direction);
    expect(open).toHaveBeenCalledWith(direction);
  });
});

describe("LayoutItem", () => {
  let open: jest.Mock;
  let layoutItem: LayoutItem;
  let empty: Empty;
  let vim: Neovim;

  beforeEach(() => {
    const width = jest.fn().mockImplementation(async () => {
      return 1;
    })();
    const height = jest.fn().mockImplementation(async () => {
      return 2;
    })();

    const WindowClass: jest.Mock<Window> = jest.fn(() => ({
      width: width,
      height: height,
    })) as any;
    const window = new WindowClass();

    const gotWindow = jest.fn().mockImplementation(async () => {
      return window;
    })();
    const setWindow = jest.fn();
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({
      window: gotWindow,
      setWindow: setWindow,
    })) as any;
    vim = new NeovimClass();

    open = jest.fn();
    const EmptyClass: jest.Mock<Empty> = jest.fn(() => ({
      open: open,
    })) as any;
    empty = new EmptyClass();

    const BufferItemClass: jest.Mock<BufferItem> = jest.fn(() => ({
      open: open,
      isActive: true,
    })) as any;
    const bufferItem = new BufferItemClass();

    const insideLayoutItem = new LayoutItem(
      [bufferItem, bufferItem],
      Direction.VERTICAL,
      null,
      vim,
      empty
    );

    layoutItem = new LayoutItem(
      [insideLayoutItem],
      Direction.HORIZONTAL,
      null,
      vim,
      empty
    );
  });

  it("openLayout", async () => {
    await layoutItem.openLayout();
  });

  it("openLayout but there is no items", async () => {
    const layoutItem = new LayoutItem(
      [],
      Direction.HORIZONTAL,
      null,
      vim,
      empty
    );
    await layoutItem.openLayout();
  });
});

describe("LayoutParser", () => {
  let requester: Requester;
  let buffers: Buffers;
  let open: jest.Mock;
  let get: jest.Mock;
  let layoutParser: LayoutParser;

  beforeEach(() => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    const vim = new NeovimClass();

    const RequesterClass: jest.Mock<Requester> = jest.fn(() => ({})) as any;
    requester = new RequesterClass();

    open = jest.fn();
    const BaseBufferClass: jest.Mock<BaseBuffer> = jest.fn(() => ({
      open: open,
    })) as any;
    const buffer = new BaseBufferClass();

    get = jest.fn().mockReturnValue(buffer);
    const BuffersClass: jest.Mock<Buffers> = jest.fn(() => ({
      get: get,
    })) as any;
    buffers = new BuffersClass(vim, requester);

    layoutParser = new LayoutParser(vim, buffers);
  });

  [
    { items: [], direction: Direction.HORIZONTAL },
    { items: [{ name: "ctrl" }], direction: Direction.HORIZONTAL },
    {
      items: [{ name: "ctrl" }, { name: "currentTab" }],
      direction: Direction.VERTICAL,
    },
    {
      items: [
        { name: "ctrl" },
        {
          items: [{ name: "ctrl" }, { name: "ctrl" }],
          direction: Direction.HORIZONTAL,
        },
      ],
      direction: Direction.VERTICAL,
      sizeParcents: [30, 70],
    },
  ].forEach(data => {
    const jsonString = JSON.stringify(data);
    it(`parse succeeds if arg is "${jsonString}"`, () => {
      layoutParser.parse(data, null);
    });
  });
});
