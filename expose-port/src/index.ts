import * as core from "@actions/core";
import { VendorPortalApi, exposeClusterPort } from "replicated-lib";

async function run() {
  try {
    const apiToken = core.getInput("api-token");
    const clusterId = core.getInput("cluster-id");
    const port = core.getInput("port");
    const protocols = core.getInput("protocols").split(",");
    const apiEndpoint = core.getInput("replicated-api-endpoint");

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    let exposedPort = await exposeClusterPort(
      apiClient,
      clusterId,
      Number(port),
      protocols
    );
    core.info(`Exposed Port on ${exposedPort.hostname}`);
    core.setOutput("hostname", exposedPort.hostname);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
