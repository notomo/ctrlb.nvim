import { Neovim } from "neovim";
import { Buffers } from "./index";
import { CtrlbBufferType } from "./type";
import { Requester } from "../requester";
import { Nothing } from "./nothing";

describe("Buffers", () => {
  it("get", () => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const vim = new NeovimClass();

    const RequesterClass = jest.fn<Requester>(() => ({}));
    const requester = new RequesterClass();

    const buffers = new Buffers(vim, requester);

    const buf = buffers.get(CtrlbBufferType.nothing);
    expect(buf).toEqual(new Nothing(vim, requester));
  });
});
