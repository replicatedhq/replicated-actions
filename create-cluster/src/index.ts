import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VendorPortalApi, createCluster, getKubeconfig, pollForStatus } from 'replicated-lib';

import { parse } from 'yaml'

async function run() {
  try {
    const apiToken = core.getInput('api-token')
    const name = core.getInput('cluster-name');
    const k8sDistribution = core.getInput('kubernetes-distribution');
    const k8sVersion = core.getInput('kubernetes-version');
    const k8sTTL = core.getInput('ttl');
    const diskGib: number = +(core.getInput('disk'));
    const nodeCount: number = +(core.getInput('nodes'));
    const instanceType = core.getInput('instance-type');
    const timeoutMinutes: number = +(core.getInput('timeout-minutes') || 20);
    const tags = core.getInput('tags');
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    let kubeconfigPath = core.getInput('kubeconfig-path');
    const exportKubeconfig = core.getInput('export-kubeconfig') === 'true';
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const tagsArray = processTags(tags)

    let cluster = await createCluster(apiClient, name, k8sDistribution, k8sVersion, k8sTTL, diskGib, nodeCount, instanceType, tagsArray);
    core.info(`Created cluster ${cluster.id} - waiting for it to be ready...`);
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
        kubeconfigPath = `${os.homedir()}/.kube/kubeconfig-${k8sDistribution}-${k8sVersion}`;
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

function processTags(tags: string): [] | undefined {
  if (tags) {
    const tagsYAML = parse(tags)
    
    // for each tag in tagsYAML, convert to json and add to array
    const tagsArray = tagsYAML.map((tag: any) => {
      return {key: tag.key, value: tag.value}
    })
    return tagsArray
  }
  return undefined
}


run()