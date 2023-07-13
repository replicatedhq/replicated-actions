import * as core from '@actions/core';
import { createCluster, getKubeconfig, pollForStatus } from 'replicated-lib';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const apiToken = core.getInput('api-token')
    const name = core.getInput('cluster-name');
    const k8sDistribution = core.getInput('kubernetes-distribution');
    const k8sVersion = core.getInput('kubernetes-version');
    const k8sTTL = core.getInput('ttl');
    const timeoutMinutes: number = +(core.getInput('timeout-minutes') || 20);
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    let cluster = await createCluster(apiClient, name, k8sDistribution, k8sVersion, k8sTTL);
    core.info(`Created cluster ${cluster.id} - waiting for it to be ready...`);
    cluster = await pollForStatus(apiClient, cluster.id, 'running', timeoutMinutes*60);
    const kubeconfig = await getKubeconfig(apiClient, cluster.id);

    core.setOutput('cluster-id', cluster.id);
    core.setOutput('cluster-kubeconfig', kubeconfig);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()