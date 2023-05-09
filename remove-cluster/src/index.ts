import * as core from '@actions/core';
import { removeCluster } from 'replicated-lib';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const apiToken = core.getInput('replicated-api-token')
    const clusterId = core.getInput('cluster-id');

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    await removeCluster(apiClient, clusterId);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()