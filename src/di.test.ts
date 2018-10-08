import { Neovim } from "neovim";
import { Di } from "./di";

describe("Di", () => {
  it("get", () => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const vim = new NeovimClass();

    Di.get("Ctrlb", vim);
    Di.get("Reporter", vim);
    Di.clear();
    Di.get("Ctrlb", vim);
    Di.get("Reporter", vim);
    Di.clear();
  });
});
