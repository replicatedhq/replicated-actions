import * as core from '@actions/core';
import { VendorPortalApi, Channel, Release, createChannel, getChannelDetails, createRelease, createReleaseFromChart, promoteRelease, pollForAirgapReleaseStatus, getDownloadUrlAirgapBuildRelease } from 'replicated-lib';

export async function actionCreateRelease() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const chart = core.getInput('chart')
    const yamlDir = core.getInput('yaml-dir')
    const promoteChannel = core.getInput('promote-channel')
    const releaseVersion = core.getInput('version')
    const releaseNotes = core.getInput('release-notes')
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    const parsedTimeout = parseInt(core.getInput('timeout-minutes') || '20');
    if (isNaN(parsedTimeout) || parsedTimeout <= 0) {
      core.setFailed('timeout-minutes must be a positive number');
      return;
    }
    const timeoutMinutes = parsedTimeout;
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    if (chart && yamlDir) {
      core.setFailed('You must provide either a chart or a YAML directory, not both');
    }

    if (chart === "" && yamlDir === "") {
      core.setFailed('You must provide either a chart or a YAML directory');
    }

    let release: Release;
    if (chart) {
      release = await createReleaseFromChart(apiClient, appSlug, chart);
    } else {
      release = await createRelease(apiClient, appSlug, yamlDir)
    }

    // If promote channel is specified, promote release
    if (promoteChannel) {
      const channel = getChannelDetails(apiClient, appSlug, {name: promoteChannel})
      let resolvedChannel: Channel | undefined
      await channel.then((channel) => {
        console.log(channel.name);
        resolvedChannel = channel
      }, (reason) => {
          if (reason.channel === null) {
              console.error(reason.reason);
          } 
      })

      if (!resolvedChannel) {
        resolvedChannel = await createChannel(apiClient, appSlug, promoteChannel)
      }

      await promoteRelease(apiClient, appSlug, resolvedChannel.id, +release.sequence, releaseVersion, releaseNotes);

      if (resolvedChannel.buildAirgapAutomatically) {
        try {
          const status = await pollForAirgapReleaseStatus(apiClient, appSlug, resolvedChannel.id, +release.sequence, "built", timeoutMinutes);
          if (status === "built") {
            const downloadUrl = await getDownloadUrlAirgapBuildRelease(apiClient, appSlug, resolvedChannel.id, +release.sequence);
            core.setOutput('airgap-status', status);
            core.setOutput('airgap-url', downloadUrl);
          } else {
            core.setOutput('airgap-status', status);
          }
        } catch (error) {
          core.setOutput('airgap-status', 'failed');
          console.warn('Failed to get airgap build status or download URL:', error.message);
        }
      }

      core.setOutput('channel-slug', resolvedChannel.slug);
    }
    core.setOutput('release-sequence', release.sequence);

  } catch (error) {
    core.setFailed(error.message);
  }
}
