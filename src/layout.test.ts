import { Ctrl } from "./buffers/ctrl";
import { Direction } from "./direction";
import { BufferItem, LayoutParser, LayoutItem } from "./layout";
import { Neovim, Window } from "neovim";
import { Buffers } from "./buffers";
import { Requester } from "./requester";
import { BaseBuffer } from "./buffers/base";
import { Nothing } from "./buffers/nothing";

describe("BufferItem", () => {
  let bufferItem: BufferItem;
  let ctrl: Ctrl;
  let open: jest.Mock;

  beforeEach(() => {
    open = jest.fn();
    const CtrlClass = jest.fn<Ctrl>(() => ({
      open: open,
    }));
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
  let nothing: Nothing;
  let vim: Neovim;

  beforeEach(() => {
    const width = jest.fn().mockImplementation(async () => {
      return 1;
    })();
    const height = jest.fn().mockImplementation(async () => {
      return 2;
    })();

    const WindowClass = jest.fn<Window>(() => ({
      width: width,
      height: height,
    }));
    const window = new WindowClass();

    const gotWindow = jest.fn().mockImplementation(async () => {
      return window;
    })();
    const setWindow = jest.fn();
    const NeovimClass = jest.fn<Neovim>(() => ({
      window: gotWindow,
      setWindow: setWindow,
    }));
    vim = new NeovimClass();

    open = jest.fn();
    const NothingClass = jest.fn<Nothing>(() => ({
      open: open,
    }));
    nothing = new NothingClass();

    const BufferItemClass = jest.fn<BufferItem>(() => ({
      open: open,
      isActive: true,
    }));
    const bufferItem = new BufferItemClass();

    const insideLayoutItem = new LayoutItem(
      [bufferItem, bufferItem],
      Direction.VERTICAL,
      null,
      vim,
      nothing
    );

    layoutItem = new LayoutItem(
      [insideLayoutItem],
      Direction.HORIZONTAL,
      null,
      vim,
      nothing
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
      nothing
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
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const vim = new NeovimClass();

    const RequesterClass = jest.fn<Requester>(() => ({}));
    requester = new RequesterClass();

    open = jest.fn();
    const BaseBufferClass = jest.fn<BaseBuffer>(() => ({
      open: open,
    }));
    const buffer = new BaseBufferClass();

    get = jest.fn().mockReturnValue(buffer);
    const BuffersClass = jest.fn<Buffers>(() => ({
      get: get,
    }));
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
