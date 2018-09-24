import { NvimPlugin, Neovim } from "neovim";
import newPlugin from "./index";

describe("CtrlbPlugin", () => {
  let setOptions: jest.Mock;
  let registerFunction: jest.Mock;

  it("constructor", () => {
    const NeovimClass = jest.fn<Neovim>(() => ({}));
    const nvim = new NeovimClass();

    setOptions = jest.fn();
    registerFunction = jest.fn();
    const NvimPluginClass = jest.fn<NvimPlugin>(() => ({
      nvim: nvim,
      setOptions: setOptions,
      registerFunction: registerFunction,
    }));
    const plugin = new NvimPluginClass();

    newPlugin(plugin);
  });
});
