import * as core from "@actions/core";
import { VendorPortalApi, getVMDetails } from "replicated-lib";

export async function actionGetVMSSHEndpoint() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const vmId = core.getInput("vm-id", { required: true });
    const username = core.getInput("username");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    const vm = await getVMDetails(apiClient, vmId);

    let sshEndpoint = "";
    if (vm.sshEndpoint) {
      const host = vm.sshEndpoint;
      const port = vm.sshPort || 22;
      if (username) {
        sshEndpoint = `ssh -p ${port} ${username}@${host}`;
      } else {
        sshEndpoint = `ssh -p ${port} ${host}`;
      }
    } else {
      throw new Error(`VM ${vmId} does not have an SSH endpoint`);
    }

    core.info(`VM ${vmId} SSH endpoint: ${sshEndpoint}`);
    core.setOutput("ssh-endpoint", sshEndpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(message);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
    core.setFailed(message);
  }
}
