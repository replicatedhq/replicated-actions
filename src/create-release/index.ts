import * as core from '@actions/core';
import { VendorPortalApi, Channel, Release, createChannel, getChannelDetails, createRelease, createReleaseFromChart, promoteRelease  } from 'replicated-lib';

export async function actionCreateRelease() {
  try {
    const appSlug = core.getInput('app-slug')
    const apiToken = core.getInput('api-token')
    const chart = core.getInput('chart')
    const yamlDir = core.getInput('yaml-dir')
    const promoteChannel = core.getInput('promote-channel')
    const releaseVersion = core.getInput('version')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
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

      await promoteRelease(apiClient, appSlug, resolvedChannel.id, +release.sequence, releaseVersion)
      core.setOutput('channel-slug', resolvedChannel.slug);
    }
    core.setOutput('release-sequence', release.sequence);

  } catch (error) {
    core.setFailed(error.message);
  }
}
