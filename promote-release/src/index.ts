import * as core from '@actions/core';
import { VendorPortalApi, Channel, promoteRelease, getChannelDetails } from 'replicated-lib';


async function run() {
  try {
    const appSlug = core.getInput('app-slug')
    const apiToken = core.getInput('api-token')
    const channelSlug = core.getInput('channel-to')
    const releaseSequence = core.getInput('release-sequence')
    const releaseVersion = core.getInput('release-version')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const channel: Channel = await getChannelDetails(apiClient, appSlug, {slug: channelSlug})

    await promoteRelease(apiClient, appSlug, channel.id, +releaseSequence, releaseVersion)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()