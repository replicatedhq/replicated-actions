import * as core from "@actions/core";
import * as exec from "@actions/exec";

const mockTmpDir = jest.fn();
const appendFileSyncMock = jest.fn();

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  appendFileSync: appendFileSyncMock,
  copyFileSync: jest.fn(),
  promises: {
    glob: jest.fn().mockResolvedValue([])
  }
}));

jest.mock("tmp-promise", () => ({
  dir: mockTmpDir
}));

let mockHttpGet: jest.Mock;

// The three airgap helpers (getAirgapBuildStatus, getLatestAirgapStatusForRelease,
// getAirgapBundleDownloadURL) live in replicated-lib. Rather than importing the
// real lib (which CJS-requires @actions/http-client and trips ts-jest's ESM
// resolver), we re-implement them here so each test's existing mockHttpGet
// fixtures continue to drive the action's polling loop end-to-end. The lib's
// own wire-shape mapping is covered by tests in the lib repo.
jest.mock("replicated-lib", () => ({
  VendorPortalApi: jest.fn().mockImplementation(() => ({
    apiToken: "test-token",
    endpoint: "https://api.replicated.com/vendor/v3",
    client: jest.fn().mockImplementation(() => ({
      get: (...args: any[]) => mockHttpGet(...args)
    }))
  })),
  findAndParseConfig: jest.fn(),
  createRelease: jest.fn().mockResolvedValue({ sequence: "1" }),
  createReleaseFromChart: jest.fn().mockResolvedValue({ sequence: "2" }),
  getChannelDetails: jest.fn().mockResolvedValue({
    id: "chan-1",
    name: "Unstable",
    slug: "unstable",
    buildAirgapAutomatically: false
  }),
  createChannel: jest.fn(),
  promoteRelease: jest.fn(),
  getApplicationDetails: jest.fn().mockResolvedValue({ id: "app-id-1" }),
  getAirgapBuildStatus: jest.fn(async (_api: any, appId: string, channelId: string, channelSequence: number) => {
    const uri = `https://api.replicated.com/vendor/v3/app/${appId}/channel/${channelId}/release/${channelSequence}/airgap/status`;
    const res = await mockHttpGet(uri);
    if (res.message.statusCode === 404) return null;
    if (res.message.statusCode !== 200) {
      throw new Error(`Failed to get airgap build status: Server responded with ${res.message.statusCode}`);
    }
    const body = JSON.parse(await res.readBody());
    return {
      channelId,
      channelSequence,
      channelName: body.channelName || "",
      airgapBuildStatus: body.airgapBuildStatus || "",
      airgapBuildError: body.airgapBuildError || ""
    };
  }),
  getLatestAirgapStatusForRelease: jest.fn(async (_api: any, appId: string, channelId: string, releaseSequence: number) => {
    const uri = `https://api.replicated.com/vendor/v3/app/${appId}/channel/${channelId}/releases`;
    const res = await mockHttpGet(uri);
    if (res.message.statusCode !== 200) {
      throw new Error(`Failed to get channel releases: Server responded with ${res.message.statusCode}`);
    }
    const body = JSON.parse(await res.readBody());
    if (!body.releases || !Array.isArray(body.releases)) return null;
    const matching = body.releases.filter((r: any) => r.sequence === releaseSequence);
    if (matching.length === 0) return null;
    const release = matching.reduce((latest: any, r: any) => ((r.channelSequence ?? 0) > (latest.channelSequence ?? 0) ? r : latest));
    return {
      channelId,
      channelSequence: release.channelSequence ?? 0,
      channelName: release.channelName || "",
      airgapBuildStatus: release.airgapBuildStatus || "",
      airgapBuildError: release.airgapBuildError || ""
    };
  }),
  getAirgapBundleDownloadURL: jest.fn(async (_api: any, appId: string, channelId: string, channelSequence: number) => {
    const uri = `https://api.replicated.com/vendor/v3/app/${appId}/channel/${channelId}/airgap/download-url?channelSequence=${channelSequence}`;
    const res = await mockHttpGet(uri);
    if (res.message.statusCode !== 200) {
      throw new Error(`Failed to get airgap bundle download URL: Server responded with ${res.message.statusCode}`);
    }
    const body = JSON.parse(await res.readBody());
    return body.url;
  })
}));

import { findAndParseConfig, createRelease, createReleaseFromChart, getChannelDetails } from "replicated-lib";
import { actionCreateRelease, pollAirgapBuildStatus } from "./index";

const getInputMock = core.getInput as jest.MockedFunction<typeof core.getInput>;
const setFailedMock = core.setFailed as jest.MockedFunction<typeof core.setFailed>;
const setOutputMock = core.setOutput as jest.MockedFunction<typeof core.setOutput>;
const infoMock = core.info as jest.MockedFunction<typeof core.info>;
const execMock = exec.exec as jest.MockedFunction<typeof exec.exec>;

const findAndParseConfigMock = findAndParseConfig as jest.MockedFunction<typeof findAndParseConfig>;
const createReleaseMock = createRelease as jest.MockedFunction<typeof createRelease>;
const createReleaseFromChartMock = createReleaseFromChart as jest.MockedFunction<typeof createReleaseFromChart>;
const getChannelDetailsMock = getChannelDetails as jest.MockedFunction<typeof getChannelDetails>;

function setInputs(inputs: Record<string, string>) {
  getInputMock.mockImplementation((name: string) => inputs[name] ?? "");
}

function createMockHttpResponse(statusCode: number, body: any) {
  return {
    message: { statusCode },
    readBody: jest.fn().mockResolvedValue(JSON.stringify(body))
  };
}

beforeEach(() => {
  getInputMock.mockReset();
  setFailedMock.mockReset();
  setOutputMock.mockReset();
  infoMock.mockReset();
  execMock.mockReset();
  execMock.mockResolvedValue(0);
  findAndParseConfigMock.mockReset();
  createReleaseMock.mockClear();
  createReleaseFromChartMock.mockClear();
  getChannelDetailsMock.mockClear();
  mockHttpGet = jest.fn();
  appendFileSyncMock.mockClear();
  delete process.env.GITHUB_STEP_SUMMARY;
  process.env.REPLICATED_AIRGAP_POLL_MS = "10";
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
      "promote-channel": ""
    });

    await actionCreateRelease();

    expect(findAndParseConfigMock).not.toHaveBeenCalled();
    expect(createReleaseFromChartMock).toHaveBeenCalledWith(expect.any(Object), "my-app", "./my-chart");
    expect(createReleaseMock).not.toHaveBeenCalled();
  });

  it("uses explicit yaml-dir input and skips config discovery", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": ""
    });

    await actionCreateRelease();

    expect(findAndParseConfigMock).not.toHaveBeenCalled();
    expect(createReleaseMock).toHaveBeenCalledWith(expect.any(Object), "my-app", "./manifests");
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
      "promote-channel": ""
    });

    findAndParseConfigMock.mockReturnValue({
      appSlug: "config-app",
      charts: [{ path: "./chart" }],
      manifests: ["./manifests/*.yaml"],
      promoteToChannelNames: ["Unstable"]
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-123",
      cleanup: jest.fn()
    });

    await actionCreateRelease();

    expect(findAndParseConfigMock).toHaveBeenCalledWith(process.cwd());
    expect(execMock).toHaveBeenCalledWith("helm", ["dependency", "update"], {
      cwd: "./chart"
    });
    expect(execMock).toHaveBeenCalledWith("helm", ["package", ".", "-d", "/tmp/staging-123"], { cwd: "./chart" });
    expect(createReleaseMock).toHaveBeenCalledWith(expect.any(Object), "config-app", "/tmp/staging-123");
    expect(createReleaseFromChartMock).not.toHaveBeenCalled();
  });

  it("prefers explicit app-slug over config appSlug", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "explicit-app",
      chart: "",
      "yaml-dir": "",
      "promote-channel": ""
    });

    findAndParseConfigMock.mockReturnValue({
      appSlug: "config-app",
      charts: [],
      manifests: []
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-456",
      cleanup: jest.fn()
    });

    await actionCreateRelease();

    expect(createReleaseMock).toHaveBeenCalledWith(expect.any(Object), "explicit-app", "/tmp/staging-456");
  });

  it("uses promoteToChannelNames from config when no explicit promote-channel", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "",
      "promote-channel": ""
    });

    findAndParseConfigMock.mockReturnValue({
      appSlug: "my-app",
      charts: [],
      manifests: [],
      promoteToChannelNames: ["Beta"]
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-789",
      cleanup: jest.fn()
    });

    await actionCreateRelease();

    expect(getChannelDetailsMock).toHaveBeenCalledWith(expect.any(Object), "my-app", { name: "Beta" });
  });

  it("fails when no inputs and no .replicated config found", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "",
      chart: "",
      "yaml-dir": "",
      "promote-channel": ""
    });

    findAndParseConfigMock.mockReturnValue(null);

    await actionCreateRelease();

    expect(setFailedMock).toHaveBeenCalledWith("You must provide either a chart or a YAML directory, or a .replicated config file");
    expect(createReleaseMock).not.toHaveBeenCalled();
    expect(createReleaseFromChartMock).not.toHaveBeenCalled();
  });

  it("fails when app-slug is empty after config resolution", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "",
      chart: "",
      "yaml-dir": "",
      "promote-channel": ""
    });

    findAndParseConfigMock.mockReturnValue({
      charts: [],
      manifests: []
    });

    mockTmpDir.mockResolvedValue({
      path: "/tmp/staging-000",
      cleanup: jest.fn()
    });

    await actionCreateRelease();

    expect(setFailedMock).toHaveBeenCalledWith("app-slug is required when no .replicated config is found");
    expect(createReleaseMock).not.toHaveBeenCalled();
  });
});

describe("actionCreateRelease airgap build handling", () => {
  it("prints warning when wait-for-airgap-build is false and auto-build is enabled", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "false"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: true
    });

    await actionCreateRelease();

    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("::warning::Airgap bundles are building asynchronously"));
    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "promoted-channel-building-async");
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("succeeds when airgap build reaches 'built' status", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "true",
      "timeout-minutes": "1"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: true
    });

    process.env.GITHUB_STEP_SUMMARY = "/tmp/summary.md";

    // First call: channel releases (in-flight)
    mockHttpGet.mockResolvedValueOnce(
      createMockHttpResponse(200, {
        releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "building", airgapBuildError: "" }]
      })
    );

    // Second call: dedicated airgap status endpoint (built)
    mockHttpGet.mockResolvedValueOnce(
      createMockHttpResponse(200, {
        airgapBuildStatus: "built",
        airgapBuildError: ""
      })
    );

    // Third call: download URL
    mockHttpGet.mockResolvedValueOnce(createMockHttpResponse(200, { url: "https://example.com/airgap.bundle" }));

    await actionCreateRelease();

    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "built");
    expect(setOutputMock).toHaveBeenCalledWith("airgap-url", "https://example.com/airgap.bundle");
    expect(setFailedMock).not.toHaveBeenCalled();
    expect(appendFileSyncMock).toHaveBeenCalled();
  });

  it("warns but does not fail when airgap build reaches 'warn' status", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "true",
      "timeout-minutes": "1"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: true
    });

    process.env.GITHUB_STEP_SUMMARY = "/tmp/summary.md";

    mockHttpGet.mockResolvedValueOnce(
      createMockHttpResponse(200, {
        releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "warn", airgapBuildError: "some images not found" }]
      })
    );

    await actionCreateRelease();

    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "warn");
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("::warning::Airgap build completed with warnings"));
    expect(setFailedMock).not.toHaveBeenCalled();
    expect(appendFileSyncMock).toHaveBeenCalled();
  });

  it("fails when airgap build reaches 'failed' status", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "true",
      "timeout-minutes": "1"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: true
    });

    process.env.GITHUB_STEP_SUMMARY = "/tmp/summary.md";

    mockHttpGet.mockResolvedValueOnce(
      createMockHttpResponse(200, {
        releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "failed", airgapBuildError: "unauthorized to pull image" }]
      })
    );

    await actionCreateRelease();

    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "failed");
    expect(setFailedMock).toHaveBeenCalledWith(expect.stringContaining("Airgap build failed"));
    expect(appendFileSyncMock).toHaveBeenCalled();
  });

  it("fails when airgap build reaches 'cancelled' status", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "true",
      "timeout-minutes": "1"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: true
    });

    mockHttpGet.mockResolvedValueOnce(
      createMockHttpResponse(200, {
        releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "cancelled", airgapBuildError: "build cancelled by user" }]
      })
    );

    await actionCreateRelease();

    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "cancelled");
    expect(setFailedMock).toHaveBeenCalledWith(expect.stringContaining("Airgap build failed"));
  });

  it("continues polling through in-flight states and eventually succeeds", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "true",
      "timeout-minutes": "1"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: true
    });

    process.env.GITHUB_STEP_SUMMARY = "/tmp/summary.md";

    // First call: channel releases (pending)
    mockHttpGet
      .mockResolvedValueOnce(
        createMockHttpResponse(200, {
          releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "pending", airgapBuildError: "" }]
        })
      )
      .mockResolvedValueOnce(
        createMockHttpResponse(200, {
          airgapBuildStatus: "building",
          airgapBuildError: ""
        })
      )
      .mockResolvedValueOnce(
        createMockHttpResponse(200, {
          airgapBuildStatus: "built",
          airgapBuildError: ""
        })
      );

    // download URL
    mockHttpGet.mockResolvedValueOnce(createMockHttpResponse(200, { url: "https://example.com/airgap.bundle" }));

    await actionCreateRelease();

    expect(mockHttpGet).toHaveBeenCalledTimes(4);
    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "built");
    expect(setFailedMock).not.toHaveBeenCalled();
  });

  it("does not print warning when buildAirgapAutomatically is false", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "wait-for-airgap-build": "false"
    });

    getChannelDetailsMock.mockResolvedValue({
      id: "chan-1",
      name: "Unstable",
      slug: "unstable",
      buildAirgapAutomatically: false
    });

    await actionCreateRelease();

    expect(infoMock).not.toHaveBeenCalledWith(expect.stringContaining("::warning::"));
    expect(setOutputMock).toHaveBeenCalledWith("airgap-status", "promoted-channel-not-airgap-enabled");
  });
});

describe("actionCreateRelease notify-users input", () => {
  it("passes notifyUsers=true to promoteRelease when notify-users is 'true'", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "notify-users": "true"
    });

    await actionCreateRelease();

    const promoteReleaseMock = jest.requireMock("replicated-lib").promoteRelease;
    expect(promoteReleaseMock).toHaveBeenCalledWith(expect.any(Object), "my-app", "chan-1", 1, "", "", true);
  });

  it("passes notifyUsers=false to promoteRelease when notify-users is 'false'", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable",
      "notify-users": "false"
    });

    await actionCreateRelease();

    const promoteReleaseMock = jest.requireMock("replicated-lib").promoteRelease;
    expect(promoteReleaseMock).toHaveBeenCalledWith(expect.any(Object), "my-app", "chan-1", 1, "", "", false);
  });

  it("passes notifyUsers=false to promoteRelease when notify-users is absent", async () => {
    setInputs({
      "api-token": "token",
      "app-slug": "my-app",
      chart: "",
      "yaml-dir": "./manifests",
      "promote-channel": "Unstable"
    });

    await actionCreateRelease();

    const promoteReleaseMock = jest.requireMock("replicated-lib").promoteRelease;
    expect(promoteReleaseMock).toHaveBeenCalledWith(expect.any(Object), "my-app", "chan-1", 1, "", "", false);
  });
});

describe("pollAirgapBuildStatus", () => {
  it("continues polling through in-flight states and eventually succeeds", async () => {
    const api = new (jest.requireMock("replicated-lib").VendorPortalApi)();

    mockHttpGet
      .mockResolvedValueOnce(
        createMockHttpResponse(200, {
          releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "pending", airgapBuildError: "" }]
        })
      )
      .mockResolvedValueOnce(
        createMockHttpResponse(200, {
          airgapBuildStatus: "building",
          airgapBuildError: ""
        })
      )
      .mockResolvedValueOnce(
        createMockHttpResponse(200, {
          airgapBuildStatus: "built",
          airgapBuildError: ""
        })
      );

    const result = await pollAirgapBuildStatus(api, "app-id", "chan-1", 1, 1, 10);
    expect(result.airgapBuildStatus).toBe("built");
    expect(mockHttpGet).toHaveBeenCalledTimes(3);
  });

  it("fails on timeout when build never reaches terminal state", async () => {
    const api = new (jest.requireMock("replicated-lib").VendorPortalApi)();
    mockHttpGet.mockResolvedValue(
      createMockHttpResponse(200, {
        releases: [{ sequence: 1, channelSequence: 5, airgapBuildStatus: "building", airgapBuildError: "" }]
      })
    );

    await expect(pollAirgapBuildStatus(api, "app-id", "chan-1", 1, 0.05, 10)).rejects.toThrow("did not reach a terminal state");
  });

  it("throws when release is not found in channel", async () => {
    const api = new (jest.requireMock("replicated-lib").VendorPortalApi)();
    mockHttpGet.mockResolvedValue(createMockHttpResponse(200, { releases: [] }));

    await expect(pollAirgapBuildStatus(api, "app-id", "chan-1", 99, 1, 10)).rejects.toThrow("not found");
  });
});
