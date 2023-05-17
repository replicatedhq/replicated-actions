import * as core from '@actions/core';
import { promoteRelease } from 'replicated-lib';
import { Channel, getChannelDetails } from 'replicated-lib/dist/channels';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const appSlug = core.getInput('replicated-app')
    const apiToken = core.getInput('replicated-api-token')
    const channelName = core.getInput('channel-to')
    const releaseSequence = core.getInput('release-sequence')
    const releaseVersion = core.getInput('release-version')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const channel: Channel = await getChannelDetails(apiClient, appSlug, channelName)

    await promoteRelease(apiClient, appSlug, channel.id, +releaseSequence, releaseVersion)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()