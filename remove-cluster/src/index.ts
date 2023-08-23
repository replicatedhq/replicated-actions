import * as core from '@actions/core';
import { VendorPortalApi, removeCluster } from 'replicated-lib';


async function run() {
  try {
    const apiToken = core.getInput('api-token')
    const clusterId = core.getInput('cluster-id');
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    await removeCluster(apiClient, clusterId);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()