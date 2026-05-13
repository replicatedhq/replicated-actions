import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as fs from "fs";
import * as path from "path";
import * as tmpPromise from "tmp-promise";
import { VendorPortalApi, Channel, Release, createChannel, getChannelDetails, createRelease, createReleaseFromChart, promoteRelease, getApplicationDetails, findAndParseConfig, ReplicatedConfig } from "replicated-lib";

// Terminal failure states per PRD
const terminalFailureStates = new Set(["failed", "failed_with_metadata", "cancelled"]);
// Terminal success states. "built" produces a full airgap bundle (download URL
// available). "metadata" is what the airgap-builder writes when a channel does
// NOT have auto-build enabled — it generates metadata only, no bundle, but
// the build is still complete (see airgap-builder/pkg/builder/builder.go:95).
// "warn" means the bundle exists with soft warnings about unresolvable images.
const terminalSuccessStates = new Set(["built", "metadata", "warn"]);
// In-flight states that require continued polling.
const inFlightStates = new Set(["pending", "building", "building_bundle", "unknown"]);

interface AirgapStatusResult {
  status: string;
  error: string;
  channelSequence: number;
}

export async function getAirgapStatusFromChannelReleases(api: VendorPortalApi, appId: string, channelId: string, releaseSequence: number): Promise<AirgapStatusResult | null> {
  const http = await api.client();
  const uri = `${api.endpoint}/app/${appId}/channel/${channelId}/releases`;
  const res = await http.get(uri);
  if (res.message.statusCode !== 200) {
    await res.readBody();
    throw new Error(`Failed to get channel releases: Server responded with ${res.message.statusCode}`);
  }
  const body = JSON.parse(await res.readBody());
  if (!body.releases || !Array.isArray(body.releases)) {
    return null;
  }
  // A release can be promoted to the same channel multiple times — each
  // promote produces a distinct channelSequence with its own airgap build.
  // We want the most recent one (highest channelSequence) since the action
  // just promoted, so its airgap build is the one we should follow.
  const matching = body.releases.filter((r: any) => r.sequence === releaseSequence);
  if (matching.length === 0) {
    return null;
  }
  const release = matching.reduce((latest: any, r: any) => ((r.channelSequence ?? 0) > (latest.channelSequence ?? 0) ? r : latest));
  return {
    status: release.airgapBuildStatus || "",
    error: release.airgapBuildError || "",
    channelSequence: release.channelSequence || 0
  };
}

// getAirgapBuildStatus polls the dedicated airgap build status endpoint for a
// single channel-release. This is cheaper than scraping the full channel
// releases list and mirrors the endpoint the CLI uses.
export async function getAirgapBuildStatus(api: VendorPortalApi, appId: string, channelId: string, channelSequence: number): Promise<AirgapStatusResult | null> {
  const http = await api.client();
  const uri = `${api.endpoint}/app/${appId}/channel/${channelId}/release/${channelSequence}/airgap/status`;
  const res = await http.get(uri);
  if (res.message.statusCode === 404) {
    return null;
  }
  if (res.message.statusCode !== 200) {
    await res.readBody();
    throw new Error(`Failed to get airgap build status: Server responded with ${res.message.statusCode}`);
  }
  const body = JSON.parse(await res.readBody());
  return {
    status: body.airgapBuildStatus || "",
    error: body.airgapBuildError || "",
    channelSequence: channelSequence
  };
}

export async function pollAirgapBuildStatus(api: VendorPortalApi, appId: string, channelId: string, releaseSequence: number, timeoutSeconds: number, sleepMs?: number): Promise<AirgapStatusResult> {
  const intervalMs = sleepMs || parseInt(process.env.REPLICATED_AIRGAP_POLL_MS || "") || 5000;
  const deadline = Date.now() + timeoutSeconds * 1000;

  // Resolve channelSequence once from the channel releases list, then switch to
  // the cheaper dedicated endpoint for the rest of the poll.
  let channelSequence: number | undefined;
  const initialResult = await getAirgapStatusFromChannelReleases(api, appId, channelId, releaseSequence);
  if (!initialResult) {
    throw new Error(`Release ${releaseSequence} not found in channel ${channelId}`);
  }
  channelSequence = initialResult.channelSequence;

  if (terminalSuccessStates.has(initialResult.status) || terminalFailureStates.has(initialResult.status)) {
    return initialResult;
  }

  while (Date.now() < deadline) {
    const result = await getAirgapBuildStatus(api, appId, channelId, channelSequence);
    if (!result) {
      throw new Error(`Airgap build status endpoint returned 404 for channel sequence ${channelSequence}`);
    }

    if (terminalSuccessStates.has(result.status) || terminalFailureStates.has(result.status)) {
      return result;
    }

    if (inFlightStates.has(result.status)) {
      console.log(`Airgap build status: ${result.status}. Waiting ${intervalMs / 1000}s...`);
    } else {
      console.log(`Airgap build status: ${result.status} (unexpected). Waiting ${intervalMs / 1000}s...`);
    }
    await new Promise(f => setTimeout(f, intervalMs));
  }
  throw new Error(`Airgap build for release ${releaseSequence} did not reach a terminal state within ${timeoutSeconds} seconds`);
}

function writeAirgapSummary(channelName: string, status: string, error: string) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) {
    return;
  }
  const errorCell = error ? error : "-";
  const markdown = `\n## Airgap Build Status\n| Channel | Status | Error |\n| --- | --- | --- |\n| ${channelName} | ${status} | ${errorCell} |\n`;
  fs.appendFileSync(summaryFile, markdown);
}

export async function actionCreateRelease() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    let appSlug = core.getInput("app-slug");
    const chart = core.getInput("chart");
    let yamlDir = core.getInput("yaml-dir");
    let promoteChannel = core.getInput("promote-channel");
    const releaseVersion = core.getInput("version");
    const releaseNotes = core.getInput("release-notes");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    const waitForAirgapBuild = core.getInput("wait-for-airgap-build") || "false";
    const parsedTimeout = parseInt(core.getInput("timeout-minutes") || "20");
    if (isNaN(parsedTimeout) || parsedTimeout <= 0) {
      core.setFailed("timeout-minutes must be a positive number");
      return;
    }
    const timeoutMinutes = parsedTimeout;

    if (chart && yamlDir) {
      core.setFailed("You must provide either a chart or a YAML directory, not both");
      return;
    }

    // Discovery mode: neither chart nor yaml-dir provided
    if (!chart && !yamlDir) {
      const config = findAndParseConfig(process.cwd());
      if (config) {
        if (!appSlug) {
          appSlug = config.appSlug || "";
        }
        if (!promoteChannel && config.promoteToChannelNames && config.promoteToChannelNames.length > 0) {
          promoteChannel = config.promoteToChannelNames[0];
        }

        const stagingDir = await tmpPromise.dir({ unsafeCleanup: true });

        // Package charts
        if (config.charts) {
          for (const chartConfig of config.charts) {
            await exec.exec("helm", ["dependency", "update"], { cwd: chartConfig.path });
            await exec.exec("helm", ["package", ".", "-d", stagingDir.path], { cwd: chartConfig.path });
          }
        }

        // Resolve and copy manifests
        if (config.manifests) {
          for (const pattern of config.manifests) {
            const files = await Array.fromAsync(fs.promises.glob(pattern));
            for (const file of files) {
              const dest = path.join(stagingDir.path, path.basename(file));
              fs.copyFileSync(file, dest);
            }
          }
        }

        yamlDir = stagingDir.path;
      } else {
        core.setFailed("You must provide either a chart or a YAML directory, or a .replicated config file");
        return;
      }
    }

    if (!appSlug) {
      core.setFailed("app-slug is required when no .replicated config is found");
      return;
    }

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    let release: Release;
    if (chart) {
      release = await createReleaseFromChart(apiClient, appSlug, chart);
    } else {
      release = await createRelease(apiClient, appSlug, yamlDir);
    }

    // If promote channel is specified, promote release
    if (promoteChannel) {
      const channel = getChannelDetails(apiClient, appSlug, { name: promoteChannel });
      let resolvedChannel: Channel | undefined;
      await channel.then(
        channel => {
          console.log(channel.name);
          resolvedChannel = channel;
        },
        reason => {
          if (reason.channel === null) {
            console.error(reason.reason);
          }
        }
      );

      if (!resolvedChannel) {
        resolvedChannel = await createChannel(apiClient, appSlug, promoteChannel);
      }

      await promoteRelease(apiClient, appSlug, resolvedChannel.id, +release.sequence, releaseVersion, releaseNotes);

      if (resolvedChannel.buildAirgapAutomatically) {
        if (waitForAirgapBuild === "true") {
          try {
            const app = await getApplicationDetails(apiClient, appSlug);
            const result = await pollAirgapBuildStatus(apiClient, app.id, resolvedChannel.id, +release.sequence, timeoutMinutes * 60);

            core.setOutput("airgap-status", result.status);

            if (result.status === "built") {
              const http = await apiClient.client();
              const uri = `${apiClient.endpoint}/app/${app.id}/channel/${resolvedChannel.id}/airgap/download-url?channelSequence=${result.channelSequence}`;
              const res = await http.get(uri);
              if (res.message.statusCode === 200) {
                const body = JSON.parse(await res.readBody());
                core.setOutput("airgap-url", body.url);
              }
              writeAirgapSummary(resolvedChannel.name, result.status, result.error);
            } else if (result.status === "metadata") {
              // Metadata-only success: the channel doesn't have auto-build
              // enabled, so the worker only generated metadata and didn't
              // produce a bundle. No airgap-url to publish, but it's a
              // successful completion — don't fail the workflow.
              writeAirgapSummary(resolvedChannel.name, result.status, result.error);
            } else if (result.status === "warn") {
              core.info(`::warning::Airgap build completed with warnings for channel ${resolvedChannel.name}: ${result.error}`);
              writeAirgapSummary(resolvedChannel.name, result.status, result.error);
            } else if (terminalFailureStates.has(result.status)) {
              const msg = `Airgap build failed for channel ${resolvedChannel.name}: ${result.error || result.status}`;
              core.setOutput("airgap-status", result.status);
              writeAirgapSummary(resolvedChannel.name, result.status, result.error);
              core.setFailed(msg);
              return;
            }
          } catch (error: any) {
            core.setOutput("airgap-status", "failed");
            console.warn("Failed to get airgap build status or download URL:", error.message);
            writeAirgapSummary(resolvedChannel.name, "failed", error.message);
            core.setFailed(`Airgap build monitoring failed: ${error.message}`);
            return;
          }
        } else {
          core.info(`::warning::Airgap bundles are building asynchronously for channel ${resolvedChannel.name}. Enable wait-for-airgap-build: true to fail this workflow if the build fails.`);
          core.setOutput("airgap-status", "promoted-channel-building-async");
        }
      } else {
        core.setOutput("airgap-status", "promoted-channel-not-airgap-enabled");
      }

      core.setOutput("channel-slug", resolvedChannel.slug);
    }
    core.setOutput("release-sequence", release.sequence);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
