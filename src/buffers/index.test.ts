import { Neovim } from "neovim";
import { Buffers } from "./index";
import { CtrlbBufferType } from "./type";
import { Requester } from "../requester";
import { Empty } from "./empty";
import { BufferContainer } from "./container";

describe("Buffers", () => {
  it("get", () => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const vim = new NeovimClass();

    const RequesterClass = jest.fn<Requester>(() => ({}));
    const requester = new RequesterClass();

    const buffers = new Buffers(vim, requester);

    const BufferContainerClass = jest.fn<BufferContainer>(() => ({}));
    const bufferContainer = new BufferContainerClass(vim);

    const buf = buffers.get(CtrlbBufferType.empty);
    expect(buf.type).toEqual(new Empty(vim, requester, bufferContainer).type);
  });
});
