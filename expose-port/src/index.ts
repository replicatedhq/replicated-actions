import * as core from "@actions/core";
import { VendorPortalApi, exposeClusterPort } from "replicated-lib";

async function run() {
  try {
    const apiToken = core.getInput("api-token");
    const clusterId = core.getInput("cluster-id");
    const port = core.getInput("port");
    const protocols = core.getInput("protocols") ? core.getInput("protocols").split(",") : ["https"];
    const apiEndpoint = core.getInput("replicated-api-endpoint");
    const isWildcard = core.getBooleanInput("wildcard");

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

run();
