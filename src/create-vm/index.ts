import * as core from "@actions/core";
import { VendorPortalApi, createVM, pollForVMStatus } from "replicated-lib";

import { parse } from "yaml";

export async function actionCreateVM() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const distribution = core.getInput("distribution", { required: true });
    const version = core.getInput("version");
    const name = core.getInput("vm-name");
    const ttl = core.getInput("ttl");
    const diskGib: number = +core.getInput("disk");
    const instanceType = core.getInput("instance-type");
    const count: number = +core.getInput("count");
    const timeoutMinutes: number = +(core.getInput("timeout-minutes") || 20);
    const publicKeys = core.getInput("public-keys");
    const tags = core.getInput("tags");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    const tagsArray = processTags(tags);
    const publicKeysArray = processPublicKeys(publicKeys);

    const vms = await createVM(apiClient, name, distribution, ttl, version, diskGib, instanceType, count, publicKeysArray, tagsArray);
    if (vms.length === 0) {
      throw new Error("createVM returned no VMs");
    }

    const vmIds = vms.map(v => v.id);
    core.info(`Created ${vms.length} vm(s): ${vmIds.join(", ")} - waiting for them to be ready...`);
    core.setOutput("vm-id", vmIds[0]);
    core.setOutput("vm-ids", JSON.stringify(vmIds));

    let firstStatus = "";
    for (const vm of vms) {
      const ready = await pollForVMStatus(apiClient, vm.id, "running", timeoutMinutes * 60);
      core.info(`VM ${ready.id} is running.`);
      if (!firstStatus) {
        firstStatus = ready.status;
      }
    }

    core.setOutput("vm-status", firstStatus);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(message);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
    core.setFailed(message);
  }
}

function processTags(tags: string): [] | undefined {
  if (tags) {
    const tagsYAML = parse(tags);
    const tagsArray = tagsYAML.map((tag: any) => {
      return { key: tag.key, value: tag.value };
    });
    return tagsArray;
  }
  return undefined;
}

function processPublicKeys(publicKeys: string): string[] | undefined {
  if (publicKeys) {
    const parsed = parse(publicKeys);
    if (!Array.isArray(parsed)) {
      throw new Error("public-keys must be a YAML list of strings");
    }
    return parsed.map((k: any) => String(k));
  }
  return undefined;
}
