import * as core from "@actions/core";
import * as exec from "@actions/exec";

const mockTmpDir = jest.fn();

jest.mock("tmp-promise", () => ({
  dir: mockTmpDir,
}));

jest.mock("replicated-lib", () => ({
  VendorPortalApi: jest.fn().mockImplementation(() => ({
    apiToken: "",
    endpoint: undefined,
  })),
  findAndParseConfig: jest.fn(),
  createRelease: jest.fn().mockResolvedValue({ sequence: "1" }),
  createReleaseFromChart: jest.fn().mockResolvedValue({ sequence: "2" }),
  getChannelDetails: jest.fn().mockResolvedValue({
    id: "chan-1",
    name: "Unstable",
    slug: "unstable",
    buildAirgapAutomatically: false,
  }),
  createChannel: jest.fn(),
  promoteRelease: jest.fn(),
  getApplicationDetails: jest.fn().mockResolvedValue({ id: "app-id-1" }),
  pollForAirgapReleaseStatus: jest.fn(),
  getDownloadUrlAirgapBuildRelease: jest.fn(),
}));

import {
  findAndParseConfig,
  createRelease,
  createReleaseFromChart,
  getChannelDetails,
} from "replicated-lib";
import { actionCreateRelease } from "./index";

const getInputMock = core.getInput as jest.MockedFunction<typeof core.getInput>;
const setFailedMock = core.setFailed as jest.MockedFunction<typeof core.setFailed>;
const execMock = exec.exec as jest.MockedFunction<typeof exec.exec>;

const findAndParseConfigMock = findAndParseConfig as jest.MockedFunction<typeof findAndParseConfig>;
const createReleaseMock = createRelease as jest.MockedFunction<typeof createRelease>;
const createReleaseFromChartMock = createReleaseFromChart as jest.MockedFunction<typeof createReleaseFromChart>;
const getChannelDetailsMock = getChannelDetails as jest.MockedFunction<typeof getChannelDetails>;

function setInputs(inputs: Record<string, string>) {
  getInputMock.mockImplementation((name: string) => inputs[name] ?? "");
}

beforeEach(() => {
  getInputMock.mockReset();
  setFailedMock.mockReset();
  execMock.mockReset();
  execMock.mockResolvedValue(0);
  findAndParseConfigMock.mockReset();
  createReleaseMock.mockClear();
  createReleaseFromChartMock.mockClear();
  getChannelDetailsMock.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("actionCreateRelease explicit inputs", () => {
  it("uses explicit chart input and skips config discovery", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "./my-chart",
      "yaml-dir": "",
      "promote-channel": "",
    });

    await actionCreateRelease();

    expect(findAndParseConfigMock).not.toHaveBeenCalled();
    expect(createReleaseFromChartMock).toHaveBeenCalledWith(
      expect.any(Object),
      "my-app",
      "./my-chart"
    );
    expect(createReleaseMock).not.toHaveBeenCalled();
  });

  it("uses explicit yaml-dir input and skips config discovery", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "",
    });

    await actionCreateRelease();

    expect(findAndParseConfigMock).not.toHaveBeenCalled();
    expect(createReleaseMock).toHaveBeenCalledWith(
      expect.any(Object),
      "my-app",
      "./manifests"
    );
    expect(createReleaseFromChartMock).not.toHaveBeenCalled();
  });
});

describe("actionCreateRelease .replicated config discovery", () => {
  it("discovers config, stages charts and manifests, and creates release", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "",
      chart: "",
      "yaml-dir": "",
      "promote-channel": "",
    });

    findAndParseConfigMock.mockReturnValue({
      appSlug: "config-app",
      charts: [{ path: "./chart" }],
      manifests: ["./manifests/*.yaml"],
      promoteToChannelNames: ["Unstable"],
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-123",
      cleanup: jest.fn(),
    });

    await actionCreateRelease();

    expect(findAndParseConfigMock).toHaveBeenCalledWith(process.cwd());
    expect(execMock).toHaveBeenCalledWith("helm", ["dependency", "update"], {
      cwd: "./chart",
    });
    expect(execMock).toHaveBeenCalledWith(
      "helm",
      ["package", ".", "-d", "/tmp/staging-123"],
      { cwd: "./chart" }
    );
    expect(createReleaseMock).toHaveBeenCalledWith(
      expect.any(Object),
      "config-app",
      "/tmp/staging-123"
    );
    expect(createReleaseFromChartMock).not.toHaveBeenCalled();
  });

  it("prefers explicit app-slug over config appSlug", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "explicit-app",
      chart: "",
      "yaml-dir": "",
      "promote-channel": "",
    });

    findAndParseConfigMock.mockReturnValue({
      appSlug: "config-app",
      charts: [],
      manifests: [],
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-456",
      cleanup: jest.fn(),
    });

    await actionCreateRelease();

    expect(createReleaseMock).toHaveBeenCalledWith(
      expect.any(Object),
      "explicit-app",
      "/tmp/staging-456"
    );
  });

  it("uses promoteToChannelNames from config when no explicit promote-channel", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "",
      "promote-channel": "",
    });

    findAndParseConfigMock.mockReturnValue({
      appSlug: "my-app",
      charts: [],
      manifests: [],
      promoteToChannelNames: ["Beta"],
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-789",
      cleanup: jest.fn(),
    });

    await actionCreateRelease();

    expect(getChannelDetailsMock).toHaveBeenCalledWith(
      expect.any(Object),
      "my-app",
      { name: "Beta" }
    );
  });

  it("fails when no inputs and no .replicated config found", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "",
      chart: "",
      "yaml-dir": "",
      "promote-channel": "",
    });

    findAndParseConfigMock.mockReturnValue(null);

    await actionCreateRelease();

    expect(setFailedMock).toHaveBeenCalledWith(
      "You must provide either a chart or a YAML directory, or a .replicated config file"
    );
    expect(createReleaseMock).not.toHaveBeenCalled();
    expect(createReleaseFromChartMock).not.toHaveBeenCalled();
  });

  it("fails when app-slug is empty after config resolution", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "",
      chart: "",
      "yaml-dir": "",
      "promote-channel": "",
    });

    findAndParseConfigMock.mockReturnValue({
      charts: [],
      manifests: [],
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-000",
      cleanup: jest.fn(),
    });

    await actionCreateRelease();

    expect(setFailedMock).toHaveBeenCalledWith(
      "app-slug is required when no .replicated config is found"
    );
    expect(createReleaseMock).not.toHaveBeenCalled();
  });
});
