import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

jest.mock("./preflight", () => ({
  downloadPreflight: jest.fn(),
  runPreflight: jest.fn()
}));

import { actionHelmInstall } from "./index";

const getInputMock = core.getInput as jest.MockedFunction<typeof core.getInput>;
const getBooleanInputMock = core.getBooleanInput as jest.MockedFunction<typeof core.getBooleanInput>;
const execMock = exec.exec as jest.MockedFunction<typeof exec.exec>;

function setInputs(inputs: Record<string, string>) {
  getInputMock.mockImplementation((name: string) => inputs[name] ?? "");
  getBooleanInputMock.mockImplementation((name: string) => inputs[name] === "true");
}

const baseInputs: Record<string, string> = {
  "helm-path": "/usr/bin/helm",
  kubeconfig: "apiVersion: v1",
  namespace: "default",
  chart: "oci://registry.example.com/mychart",
  name: "my-release",
  "run-preflights": "false",
  wait: "false"
};

beforeEach(() => {
  getInputMock.mockReset();
  getBooleanInputMock.mockReset();
  execMock.mockReset();
  execMock.mockResolvedValue(0);
});

describe("actionHelmInstall values handling", () => {
  it("rejects when both values and values-file are set", async () => {
    setInputs({ ...baseInputs, values: "key: value", "values-file": "/tmp/anywhere.yaml" });
    await expect(actionHelmInstall()).rejects.toThrow(
      /mutually exclusive/
    );
    expect(execMock).not.toHaveBeenCalled();
  });

  it("rejects when values-file points to a missing file", async () => {
    const missing = path.join(os.tmpdir(), "definitely-missing-values-12345.yaml");
    setInputs({ ...baseInputs, "values-file": missing });
    await expect(actionHelmInstall()).rejects.toThrow(
      `values-file not found: ${missing}`
    );
    expect(execMock).not.toHaveBeenCalled();
  });

  it("passes the provided values-file path to helm --values", async () => {
    const tmp = path.join(os.tmpdir(), `values-file-test-${Date.now()}.yaml`);
    fs.writeFileSync(tmp, "key: value\n");
    try {
      setInputs({ ...baseInputs, "values-file": tmp });
      await actionHelmInstall();
      const installCall = execMock.mock.calls.find(
        (call) => Array.isArray(call[1]) && (call[1] as string[])[0] === "upgrade"
      );
      expect(installCall).toBeDefined();
      const params = installCall![1] as string[];
      const idx = params.indexOf("--values");
      expect(idx).toBeGreaterThan(-1);
      expect(params[idx + 1]).toBe(tmp);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it("writes inline values content to a temp file and passes it to helm --values", async () => {
    setInputs({ ...baseInputs, values: "key: inline-value\n" });
    await actionHelmInstall();
    const installCall = execMock.mock.calls.find(
      (call) => Array.isArray(call[1]) && (call[1] as string[])[0] === "upgrade"
    );
    expect(installCall).toBeDefined();
    const params = installCall![1] as string[];
    const idx = params.indexOf("--values");
    expect(idx).toBeGreaterThan(-1);
    const tmpPath = params[idx + 1];
    expect(fs.readFileSync(tmpPath, "utf8")).toBe("key: inline-value\n");
  });

  it("does not pass --values when neither values nor values-file is set", async () => {
    setInputs(baseInputs);
    await actionHelmInstall();
    const installCall = execMock.mock.calls.find(
      (call) => Array.isArray(call[1]) && (call[1] as string[])[0] === "upgrade"
    );
    expect(installCall).toBeDefined();
    const params = installCall![1] as string[];
    expect(params).not.toContain("--values");
  });
});
