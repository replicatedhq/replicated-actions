import * as core from "@actions/core";
import { VendorPortalApi, updateNetwork } from "replicated-lib";

export async function actionUpdateNetwork() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const networkId = core.getInput("network-id", { required: true });
    const policy = core.getInput("policy");
    const collectReportInput = core.getInput("collect-report");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    if (!policy && !collectReportInput) {
      throw new Error("At least one of `policy` or `collect-report` must be provided.");
    }

    const options: { policy?: string; collectReport?: boolean } = {};
    if (policy) {
      options.policy = policy;
    }
    if (collectReportInput) {
      options.collectReport = core.getBooleanInput("collect-report");
    }

    const network = await updateNetwork(apiClient, networkId, options);
    core.info(`Updated network ${network.id}`);
    core.setOutput("network-id", network.id);
    core.setOutput("network-status", network.status);
    if (network.policy !== undefined) {
      core.setOutput("network-policy", network.policy);
    }
    if (network.collect_report !== undefined) {
      core.setOutput("collect-report", String(network.collect_report));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(message);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
    core.setFailed(message);
  }
}
