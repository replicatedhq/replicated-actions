import * as core from '@actions/core';
import { promoteRelease } from 'replicated-lib';
import { Channel, createChannel, getChannelDetails } from 'replicated-lib/dist/channels';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';
import { createRelease } from 'replicated-lib/dist/releases';


async function run() {
  try {
    const appSlug = core.getInput('app-slug')
    const apiToken = core.getInput('replicated-api-token')
    const yamlDir = core.getInput('yaml-dir')
    const promoteChannel = core.getInput('promote-channel')
    const releaseVersion = core.getInput('version')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const release = await createRelease(apiClient, appSlug, yamlDir)

    const channel = getChannelDetails(apiClient, appSlug, promoteChannel)
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
    core.setOutput('release-sequence', release.sequence);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()