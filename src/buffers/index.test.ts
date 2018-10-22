import { Neovim } from "neovim";
import { Buffers } from "./index";
import { CtrlbBufferType } from "./type";
import { Empty } from "./empty";
import { Di } from "../di";

describe("Buffers", () => {
  let buffers: Buffers;
  let vim: Neovim;
  let empty: Empty;

  beforeEach(() => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    buffers = new Buffers(vim);

    empty = Di.get("Empty", vim);
  });

  it("get", () => {
    const buf = buffers.get(CtrlbBufferType.empty);
    expect(buf.type).toEqual(empty.type);
  });

  it("clearAll", async () => {
    await buffers.clearAll();
  });
});
