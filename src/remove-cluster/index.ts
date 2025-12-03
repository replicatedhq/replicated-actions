import * as core from "@actions/core";
import { VendorPortalApi, removeCluster } from "replicated-lib";

export async function actionRemoveCluster() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const clusterId = core.getInput("cluster-id", { required: true });
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    core.debug(`Removing cluster ${clusterId}...`);
    await removeCluster(apiClient, clusterId);
    core.info(`Removed cluster ${clusterId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
