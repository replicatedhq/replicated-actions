import * as core from '@actions/core';
import { VendorPortalApi, removeCluster } from 'replicated-lib';


export async function actionRemoveCluster() {
  try {
    const apiToken = core.getInput('api-token')
    const clusterId = core.getInput('cluster-id');
    core.debug(`Removing cluster ${clusterId}...`);
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    await removeCluster(apiClient, clusterId);
    core.info(`Removed cluster ${clusterId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
