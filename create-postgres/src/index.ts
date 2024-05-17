import * as core from "@actions/core";
import {
  VendorPortalApi,
  createAddonPostgres,
  pollForAddonStatus,
} from "replicated-lib";

async function run() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const clusterId = core.getInput("cluster-id", { required: true });
    const version = core.getInput("version");
    const instanceType = core.getInput("instance-type");
    const diskGib = +core.getInput("disk");
    const timeoutMinutes: number = +(core.getInput("timeout-minutes") || 20);
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    let addon = await createAddonPostgres(
      apiClient,
      clusterId,
      version,
      instanceType,
      diskGib
    );
    core.info(`Created Postgres ${addon.id} - waiting for it to be ready...`);
    core.setOutput("addon-id", addon.id);

    addon = await pollForAddonStatus(
      apiClient,
      clusterId,
      addon.id,
      "ready",
      timeoutMinutes * 60
    );

    core.info(`Addon ${addon.id} is ready!`);
    core.setOutput("version", addon.postgres?.version);
    core.setOutput("instance-type", addon.postgres?.instance_type);
    core.setOutput("disk", addon.postgres?.disk_gib);
    core.setOutput("uri", addon.postgres?.uri);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
