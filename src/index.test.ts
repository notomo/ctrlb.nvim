import { NvimPlugin, Neovim } from "neovim";
import { CtrlbPlugin } from "./index";
import { Ctrlb } from "./ctrlb";
import { Reporter } from "./reporter";
import { Di } from "./di";
import newPlugin from "./index";

describe("CtrlbPlugin", () => {
  let setOptions: jest.Mock;
  let registerFunction: jest.Mock;
  let ctrlbPlugin: CtrlbPlugin;
  let requestAsync: jest.Mock;
  let open: jest.Mock;
  let openLayout: jest.Mock;
  let doAction: jest.Mock;
  let clearAll: jest.Mock;
  let complete: jest.Mock;
  let error: jest.Mock;
  let plugin: NvimPlugin;

  beforeEach(() => {
    const NeovimClass: jest.Mock<Neovim> = jest.fn(() => ({})) as any;
    const nvim = new NeovimClass();

    setOptions = jest.fn();
    registerFunction = jest.fn();
    const NvimPluginClass: jest.Mock<NvimPlugin> = jest.fn(() => ({
      nvim: nvim,
      setOptions: setOptions,
      registerFunction: registerFunction,
    })) as any;
    plugin = new NvimPluginClass();

    requestAsync = jest.fn().mockImplementation(async () => {
      return;
    });
    open = jest.fn().mockImplementation(async () => {
      return;
    });
    openLayout = jest.fn().mockImplementation(async () => {
      return;
    });
    doAction = jest.fn().mockImplementation(async () => {
      return;
    });
    clearAll = jest.fn().mockImplementation(async () => {
      return;
    });
    complete = jest.fn().mockImplementation(async () => {
      return;
    });
    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      requestAsync: requestAsync,
      open: open,
      openLayout: openLayout,
      doAction: doAction,
      clearAll: clearAll,
      complete: complete,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    error = jest.fn();
    const ReporterClass: jest.Mock<Reporter> = jest.fn(() => ({
      error: error,
    })) as any;
    const reporter = new ReporterClass();
    Di.set("Reporter", reporter);

    ctrlbPlugin = new CtrlbPlugin(plugin);
  });

  it("executeAsync", async () => {
    const arg = "";
    await ctrlbPlugin.executeAsync([arg]);
    expect(requestAsync).toHaveBeenCalledWith(arg);
  });

  it("executeAsync reports error on error", async () => {
    requestAsync = jest.fn().mockImplementation(async () => {
      throw new Error("");
    });

    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      requestAsync: requestAsync,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    const ctrlbPlugin = new CtrlbPlugin(plugin);

    const arg = "";
    await ctrlbPlugin.executeAsync([arg]);
    expect(error).toHaveBeenCalled();
  });

  it("open", async () => {
    const arg = "";
    await ctrlbPlugin.open([arg]);
    expect(open).toHaveBeenCalledWith(arg);
  });

  it("open reports error on error", async () => {
    open = jest.fn().mockImplementation(async () => {
      throw new Error("");
    });

    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      open: open,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    const ctrlbPlugin = new CtrlbPlugin(plugin);

    const arg = "";
    await ctrlbPlugin.open([arg]);
    expect(error).toHaveBeenCalled();
  });

  it("openLayout", async () => {
    const arg = "";
    await ctrlbPlugin.openLayout([arg]);
    expect(openLayout).toHaveBeenCalledWith(arg);
  });

  it("openLayout reports error on error", async () => {
    openLayout = jest.fn().mockImplementation(async () => {
      throw new Error("");
    });

    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      openLayout: openLayout,
      clearAll: clearAll,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    const ctrlbPlugin = new CtrlbPlugin(plugin);

    const arg = "";
    await ctrlbPlugin.openLayout([arg]);
    expect(error).toHaveBeenCalled();
    expect(clearAll).toHaveBeenCalled();
  });

  it("doAction", async () => {
    const arg1 = "";
    const arg2 = "";
    const arg3 = 1;
    const arg4 = 2;
    await ctrlbPlugin.doAction([arg1, arg2, arg3, arg4]);
    expect(doAction).toHaveBeenCalledWith(arg1, arg2, arg3, arg4);
  });

  it("doAction reports error on error", async () => {
    doAction = jest.fn().mockImplementation(async () => {
      throw new Error("");
    });

    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      doAction: doAction,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    const ctrlbPlugin = new CtrlbPlugin(plugin);

    const arg1 = "";
    const arg2 = "";
    const arg3 = 1;
    const arg4 = 2;
    await ctrlbPlugin.doAction([arg1, arg2, arg3, arg4]);
    expect(error).toHaveBeenCalled();
  });

  it("clearAll", async () => {
    await ctrlbPlugin.clearAll();
    expect(clearAll).toHaveBeenCalled();
  });

  it("clearAll reports error on error", async () => {
    clearAll = jest.fn().mockImplementation(async () => {
      throw new Error("");
    });

    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      clearAll: clearAll,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    const ctrlbPlugin = new CtrlbPlugin(plugin);

    await ctrlbPlugin.clearAll();
    expect(error).toHaveBeenCalled();
  });

  it("complete", async () => {
    const arg1 = "";
    const arg2 = "";
    const arg3 = 1;
    await ctrlbPlugin.complete([arg1, arg2, arg3]);
    expect(complete).toHaveBeenCalledWith(arg1, arg2, arg3);
  });

  it("complete reports error on error", async () => {
    complete = jest.fn().mockImplementation(async () => {
      throw new Error("");
    });

    const CtrlbClass: jest.Mock<Ctrlb> = jest.fn(() => ({
      complete: complete,
    })) as any;
    const ctrlb = new CtrlbClass();
    Di.set("Ctrlb", ctrlb);

    const ctrlbPlugin = new CtrlbPlugin(plugin);

    const arg1 = "";
    const arg2 = "";
    const arg3 = 1;
    await ctrlbPlugin.complete([arg1, arg2, arg3]);
    expect(error).toHaveBeenCalled();
  });

  it("newPlugin", () => {
    newPlugin(plugin);
  });
});
