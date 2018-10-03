import { Neovim } from "neovim";
import { Buffers } from "./index";
import { CtrlbBufferType } from "./type";
import { Requester } from "../requester";
import { Empty } from "./empty";
import { BufferContainer } from "./container";

describe("Buffers", () => {
  let buffers: Buffers;
  let vim: Neovim;
  let requester: Requester;
  let empty: Empty;

  beforeEach(() => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    vim = new NeovimClass();

    const RequesterClass = jest.fn<Requester>(() => ({}));
    requester = new RequesterClass();

    buffers = new Buffers(vim, requester);

    const BufferContainerClass = jest.fn<BufferContainer>(() => ({}));
    const bufferContainer = new BufferContainerClass(vim);
    empty = new Empty(vim, requester, bufferContainer);
  });

  it("get", () => {
    const buf = buffers.get(CtrlbBufferType.empty);
    expect(buf.type).toEqual(empty.type);
  });

  it("clear", async () => {
    await buffers.clear(CtrlbBufferType.empty);
  });

  it("clearAll", async () => {
    await buffers.clearAll();
  });
});
