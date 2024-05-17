import * as core from "@actions/core";
import { VendorPortalApi, exposeClusterPort } from "replicated-lib";

export async function actionExposePort() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const clusterId = core.getInput("cluster-id", { required: true });
    const port = core.getInput("port");
    const protocols = (core.getInput("protocols") || "https").split(",");
    const isWildcard = core.getBooleanInput("wildcard");
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
    core.info(`Exposed Port on ${exposedPort.hostname}`);
    core.setOutput("hostname", exposedPort.hostname);
  } catch (error) {
    core.setFailed(error.message);
  }
}
