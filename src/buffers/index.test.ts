import { Neovim } from "neovim";
import { Buffers } from "./index";
import { CtrlbBufferType } from "./type";
import { Requester } from "../requester";
import { Nothing } from "./nothing";
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

    const buf = buffers.get(CtrlbBufferType.nothing);
    expect(buf.type).toEqual(new Nothing(vim, requester, bufferContainer).type);
  });
});
