import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { VendorPortalApi, createClusterWithLicense, getKubeconfig, pollForStatus } from 'replicated-lib';

import { parse } from 'yaml'

export async function actionCreateCluster() {
  try {
    const apiToken = core.getInput('api-token')
    const name = core.getInput('cluster-name');
    const k8sDistribution = core.getInput('kubernetes-distribution');
    const k8sVersion = core.getInput('kubernetes-version');
    const licenseId = core.getInput('license-id');
    const k8sTTL = core.getInput('ttl');
    const diskGib: number = +(core.getInput('disk'));
    const nodeCount: number = +(core.getInput('nodes'));
    const minNodeCount: number = +(core.getInput('min-nodes'));
    const maxNodeCount: number = +(core.getInput('max-nodes'));
    const instanceType = core.getInput('instance-type');
    const timeoutMinutes: number = +(core.getInput('timeout-minutes') || 20);
    const nodeGroups = core.getInput('node-groups');
    const tags = core.getInput('tags');
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    let kubeconfigPath = core.getInput('kubeconfig-path');
    const exportKubeconfig = core.getBooleanInput('export-kubeconfig');
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const tagsArray = processTags(tags)
    const nodeGroupsArray = processNodeGroups(nodeGroups)

    let cluster = await createClusterWithLicense(
        apiClient, name, k8sDistribution, k8sVersion, licenseId,
        k8sTTL, diskGib, nodeCount, minNodeCount, maxNodeCount,
        instanceType, nodeGroupsArray, tagsArray,
    );
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

function processNodeGroups(nodeGroups: string): [] | undefined {
  if (nodeGroups) {
    const nodeGroupsYAML = parse(nodeGroups)
    
    // for each nodeGroup in nodeGroupsYAML, convert to json and add to array
    const nodeGroupsArray = nodeGroupsYAML.map((nodegroup: any) => {
      return {name: nodegroup.name, node_count: nodegroup.nodes, instance_type: nodegroup['instance-type'], disk_gib: nodegroup.disk}
    })
    return nodeGroupsArray
  }
  return undefined
}
