import * as core from "@actions/core";
import { VendorPortalApi, removeVM } from "replicated-lib";

export async function actionRemoveVM() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const vmId = core.getInput("vm-id", { required: true });
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    core.debug(`Removing vm ${vmId}...`);
    await removeVM(apiClient, vmId);
    core.info(`Removed vm ${vmId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
