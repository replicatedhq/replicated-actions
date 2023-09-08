import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VendorPortalApi, getKubeconfig, pollForStatus, upgradeCluster } from 'replicated-lib';


async function run() {
  try {
    const apiToken = core.getInput('api-token')
    const clusterId = core.getInput('cluster-id');
    const k8sVersion = core.getInput('kubernetes-version');
    const timeoutMinutes: number = +(core.getInput('timeout-minutes') || 20);
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    let kubeconfigPath = core.getInput('kubeconfig-path');
    const exportKubeconfig = core.getInput('export-kubeconfig') === 'true';
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    let cluster = await upgradeCluster(apiClient, clusterId, k8sVersion);
    core.info(`Upgrading cluster ${cluster.id} - waiting for it to be ready...`);
    core.setOutput('cluster-id', cluster.id);

    cluster = await pollForStatus(apiClient, cluster.id, 'running', timeoutMinutes*60);
    const kubeconfig = await getKubeconfig(apiClient, cluster.id);
    core.setOutput('cluster-kubeconfig', kubeconfig);

    if (kubeconfigPath) {
      writeFile(kubeconfigPath, kubeconfig);
      core.info(`Wrote kubeconfig to ${kubeconfigPath}`);
    }

    if (exportKubeconfig) {
      if (!kubeconfigPath) {
        kubeconfigPath = `${os.homedir()}/.kube/kubeconfig-${cluster.id}`;
        writeFile(kubeconfigPath, kubeconfig);
        core.info(`Wrote kubeconfig to ${kubeconfigPath}`);
      }
      core.exportVariable('KUBECONFIG', kubeconfigPath);
      core.info(`Set KUBECONFIG=${kubeconfigPath}`);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

function writeFile(filePath: string, contents: string) {
  const directoryPath = path.dirname(filePath);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  fs.writeFileSync(filePath, contents);
}


run()