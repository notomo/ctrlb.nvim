import { Neovim } from "neovim";
import { Buffers } from "./index";
import { CtrlbBufferType } from "./type";

describe("Buffers", () => {
  let buffers: Buffers;
  let vim: Neovim;

  beforeEach(() => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    buffers = new Buffers(vim);
  });

  it("get", () => {
    buffers.get(CtrlbBufferType.empty);
  });

  it("clearAll", async () => {
    await buffers.clearAll();
  });
});
