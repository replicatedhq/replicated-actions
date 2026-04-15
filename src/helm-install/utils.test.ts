import { parseExtraFlags } from "./utils";

describe("parseExtraFlags", () => {
  it("returns empty array for empty string", () => {
    expect(parseExtraFlags("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(parseExtraFlags("   ")).toEqual([]);
  });

  it("splits simple space-separated flags", () => {
    expect(parseExtraFlags("--debug --atomic")).toEqual(["--debug", "--atomic"]);
  });

  it("keeps flag=value pairs as one token", () => {
    expect(parseExtraFlags("--set replicaCount=3")).toEqual(["--set", "replicaCount=3"]);
  });

  it("strips double quotes and keeps inner content as one token", () => {
    expect(parseExtraFlags('--set "key=hello world"')).toEqual(["--set", "key=hello world"]);
  });

  it("strips single quotes and keeps inner content as one token", () => {
    expect(parseExtraFlags("--set 'key=hello world'")).toEqual(["--set", "key=hello world"]);
  });

  it("handles multiple quoted segments", () => {
    expect(parseExtraFlags(`--set "a=1 2" --set "b=3 4"`)).toEqual([
      "--set", "a=1 2", "--set", "b=3 4",
    ]);
  });

  it("handles extra whitespace between tokens", () => {
    expect(parseExtraFlags("  --debug   --timeout  10m0s  ")).toEqual([
      "--debug", "--timeout", "10m0s",
    ]);
  });

  it("handles tabs and mixed whitespace", () => {
    expect(parseExtraFlags("--debug\t--timeout\t10m0s")).toEqual([
      "--debug", "--timeout", "10m0s",
    ]);
  });

  it("handles quoted string with equals sign", () => {
    expect(parseExtraFlags(`--set-string "image.tag=v1.2.3"`)).toEqual([
      "--set-string", "image.tag=v1.2.3",
    ]);
  });

  it("handles a single flag with no value", () => {
    expect(parseExtraFlags("--wait")).toEqual(["--wait"]);
  });

  it("handles adjacent quoted and unquoted tokens", () => {
    expect(parseExtraFlags('--timeout 10m0s --set "key=a b" --debug')).toEqual([
      "--timeout", "10m0s", "--set", "key=a b", "--debug",
    ]);
  });
});
