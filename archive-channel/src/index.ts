import * as core from '@actions/core';
import { archiveChannel } from 'replicated-lib';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const apiToken = core.getInput('api-token')
    const appSlug = core.getInput('app-slug')
    const channelSlug = core.getInput('channel-slug')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }
    
    await archiveChannel(apiClient, appSlug, channelSlug)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()