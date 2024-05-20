import * as core from "@actions/core";
import { VendorPortalApi, exposeClusterPort, pollForAddonStatus } from "replicated-lib";

export async function actionExposePort() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const clusterId = core.getInput("cluster-id", { required: true });
    const port = core.getInput("port");
    const protocols = (core.getInput("protocols") || "https").split(",");
    const isWildcard = core.getBooleanInput("wildcard");
    const timeoutMinutes: number = +(core.getInput("timeout-minutes") || 5);
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    let exposedPort = await exposeClusterPort(
      apiClient,
      clusterId,
      Number(port),
      protocols,
      isWildcard
    );

    if (exposedPort.addon_id) {
      core.info(
        `Exposed port ${port} - waiting for it to be ready...`
      );
      core.setOutput("addon-id", exposedPort.addon_id);

      await pollForAddonStatus(
        apiClient,
        clusterId,
        exposedPort.addon_id,
        "ready",
        timeoutMinutes * 60
      );
    }

    core.info(`Exposed Port on ${exposedPort.hostname}`);
    core.setOutput("hostname", exposedPort.hostname);
  } catch (error) {
    core.setFailed(error.message);
  }
}
