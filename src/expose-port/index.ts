import * as core from "@actions/core";
import { VendorPortalApi, exposeClusterPort, exposeVMPort, pollForAddonStatus } from "replicated-lib";

export async function actionExposePort() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const clusterId = core.getInput("cluster-id");
    const vmId = core.getInput("vm-id");
    const port = core.getInput("port");
    const protocols = (core.getInput("protocols") || "https").split(",");
    const isWildcard = core.getBooleanInput("wildcard");
    const timeoutMinutes: number = +(core.getInput("timeout-minutes") || 5);
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    if (clusterId && vmId) {
      throw new Error("Only one of cluster-id or vm-id can be specified");
    }
    if (!clusterId && !vmId) {
      throw new Error("One of cluster-id or vm-id must be specified");
    }

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    let exposedPort;

    if (vmId) {
      exposedPort = await exposeVMPort(apiClient, vmId, Number(port), protocols, isWildcard);
    } else {
      exposedPort = await exposeClusterPort(apiClient, clusterId, Number(port), protocols, isWildcard);
    }

    if (exposedPort.addon_id) {
      core.info(`Exposed port ${port} - waiting for it to be ready...`);
      core.setOutput("addon-id", exposedPort.addon_id);

      if (vmId) {
        core.info(`VM port exposed with state: ${exposedPort.state}`);
      } else {
        await pollForAddonStatus(apiClient, clusterId, exposedPort.addon_id, "ready", timeoutMinutes * 60);
      }
    }

    core.info(`Exposed Port on ${exposedPort.hostname}`);
    core.setOutput("hostname", exposedPort.hostname);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(message);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
    core.setFailed(message);
  }
}
