import * as core from "@actions/core";
import { VendorPortalApi, createAddonObjectStore, pollForAddonStatus } from "replicated-lib";

export async function actionCreateObjectStore() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const clusterId = core.getInput("cluster-id", { required: true });
    const bucketPrefix = core.getInput("bucket-prefix", { required: true });
    const timeoutMinutes: number = +(core.getInput("timeout-minutes") || 5);
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    let addon = await createAddonObjectStore(apiClient, clusterId, bucketPrefix);
    core.info(`Created Object Store ${addon.id} - waiting for it to be ready...`);
    core.setOutput("addon-id", addon.id);

    addon = await pollForAddonStatus(apiClient, clusterId, addon.id, "ready", timeoutMinutes * 60);

    core.info(`Addon ${addon.id} is ready!`);
    core.setOutput("bucket-name", addon.object_store?.bucket_name);
    core.setOutput("bucket-prefix", addon.object_store?.bucket_prefix);
    core.setOutput("service-account-name", addon.object_store?.service_account_name);
    core.setOutput("service-account-name-read-only", addon.object_store?.service_account_name_read_only);
    core.setOutput("service-account-namespace", addon.object_store?.service_account_namespace);
  } catch (error) {
    core.setFailed(error.message);
  }
}
