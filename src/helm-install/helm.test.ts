import * as exec from "@actions/exec";
import { installChart } from "./helm";

const execMock = exec.exec as jest.MockedFunction<typeof exec.exec>;

beforeEach(() => {
  execMock.mockReset();
  execMock.mockResolvedValue(0);
});

function extractParams(): string[] {
  return execMock.mock.calls[0][1] as string[];
}

describe("installChart", () => {
  const defaults = {
    helmPath: "/usr/bin/helm",
    kubeconfig: "apiVersion: v1",
    chart: "oci://registry.example.com/mychart",
    version: "",
    releaseName: "my-release",
    namespace: "default",
    valuesPath: "",
    wait: false,
    extraHelmFlags: "",
  };

  async function install(overrides: Partial<typeof defaults> = {}) {
    const opts = { ...defaults, ...overrides };
    await installChart(
      opts.helmPath,
      opts.kubeconfig,
      opts.chart,
      opts.version,
      opts.releaseName,
      opts.namespace,
      opts.valuesPath,
      opts.wait,
      opts.extraHelmFlags
    );
  }

  it("runs helm upgrade --install with base params", async () => {
    await install();
    const params = extractParams();
    expect(params[0]).toBe("upgrade");
    expect(params[1]).toBe("my-release");
    expect(params[2]).toBe("--install");
    expect(params).toContain("--namespace");
    expect(params).toContain("default");
    expect(params).toContain(defaults.chart);
  });

  it("appends --wait when wait is true", async () => {
    await install({ wait: true });
    expect(extractParams()).toContain("--wait");
  });

  it("does not include --wait when wait is false", async () => {
    await install({ wait: false });
    expect(extractParams()).not.toContain("--wait");
  });

  it("passes extra helm flags through to the command", async () => {
    await install({ extraHelmFlags: "--timeout 10m0s --debug" });
    const params = extractParams();
    expect(params).toContain("--timeout");
    expect(params).toContain("10m0s");
    expect(params).toContain("--debug");
  });

  it("combines --wait with extra flags", async () => {
    await install({ wait: true, extraHelmFlags: "--timeout 10m0s" });
    const params = extractParams();
    expect(params).toContain("--wait");
    expect(params).toContain("--timeout");
    expect(params).toContain("10m0s");
  });
});
