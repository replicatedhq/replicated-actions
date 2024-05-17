import * as core from '@actions/core';
import { VendorPortalApi, Channel, promoteRelease, getChannelDetails } from 'replicated-lib';


async function run() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const channelSlug = core.getInput("channel-to", { required: true });
    const releaseSequence = core.getInput("release-sequence", { required: true });
    const releaseVersion = core.getInput("release-version", { required: true });
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const channel: Channel = await getChannelDetails(apiClient, appSlug, {slug: channelSlug})

    await promoteRelease(apiClient, appSlug, channel.id, +releaseSequence, releaseVersion)
    core.info(`Release ${releaseVersion} has been promoted to channel ${channelSlug}`)
  } catch (error) {
    core.setFailed(error.message);
  }
}


run()