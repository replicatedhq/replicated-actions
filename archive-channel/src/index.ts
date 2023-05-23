import * as core from '@actions/core';
import { archiveChannel } from 'replicated-lib';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const apiToken = core.getInput('replicated-api-token')
    const appSlug = core.getInput('app-slug')
    const channelName = core.getInput('channel-name')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }
    
    await archiveChannel(apiClient, appSlug, channelName)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()