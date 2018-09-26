import { ArgParser } from "./info";

describe("ArgParser", () => {
  [
    {
      arg: "scroll:up",
      expected: { actionGroupName: "scroll", actionName: "up", args: {} },
    },
    {
      arg: "tab:get -id=1",
      expected: {
        actionGroupName: "tab",
        actionName: "get",
        args: { id: 1 },
      },
    },
    {
      arg: "tab:open -url=https://example.com/?test=1",
      expected: {
        actionGroupName: "tab",
        actionName: "open",
        args: { url: "https://example.com/?test=1" },
      },
    },
    {
      arg: "zoom:set -zoomFactor=1.5",
      expected: {
        actionGroupName: "zoom",
        actionName: "set",
        args: { zoomFactor: 1.5 },
      },
    },
    {
      arg: "tab:create -pinned",
      expected: {
        actionGroupName: "tab",
        actionName: "create",
        args: { pinned: true },
      },
    },
  ].forEach(data => {
    let arg = data.arg;
    let expected = data.expected;
    it(`parse "${data.arg}"`, () => {
      const parser = new ArgParser();
      const result = parser.parse(arg);
      expect(result).toEqual(expected);
    });
  });

  [
    { arg: "tab", expected: "Not found actionName." },
    { arg: "tab:create -", expected: "Arg key must not be empty." },
    { arg: "tab:create -=", expected: "Arg key must not be empty." },
  ].forEach(data => {
    let arg = data.arg;
    let expected = data.expected;
    it(`throw error if arg is "${arg}"`, () => {
      const parser = new ArgParser();
      expect(() => parser.parse(arg)).toThrowError(expected);
    });
  });

  [
    { arg: "ctrl", expected: true },
    { arg: "invalid", expected: false },
  ].forEach(data => {
    let arg = data.arg;
    let expected = data.expected;
    it(`isBufferType is ${expected} if value is "${arg}"`, () => {
      const parser = new ArgParser();
      expect(parser.isBufferType(arg)).toBe(expected);
    });
  });
});
