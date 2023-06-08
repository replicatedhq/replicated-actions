import * as core from '@actions/core';
import * as semver from 'semver';
import { SupportedCluster, getSupportedClusters } from 'replicated-lib/dist/clusters';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';
import { KubernetesDistribution, getUsedKubernetesDistributions } from 'replicated-lib/dist/customers';


interface MatrixInstance {
  distribution: string;
  version: string;
}

async function run() {
  try {
    const appSlug = core.getInput('app-slug');
    const apiToken = core.getInput('api-token')
    const apiEndpoint = core.getInput('replicated-api-endpoint')

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const usedDistributions = await getUsedKubernetesDistributions(apiClient, appSlug)
    const availableDistributions = await getSupportedClusters(apiClient)

    const matrix = processDistributions(usedDistributions, availableDistributions)

    core.setOutput('matrix', JSON.stringify(matrix));

  } catch (error) {
    core.setFailed(error.message);
  }
}

function processDistributions(usedDistributions: KubernetesDistribution[], availableDistributions: SupportedCluster[]): MatrixInstance[] {
  const matrixMap: { [key: string]: MatrixInstance } = {}
  const availableMap: { [key: string]: SupportedCluster } = {}
  
  core.info(`Found ${availableDistributions.length} available distributions`)
  core.info(`Found ${usedDistributions.length} used distributions`)
  
  for (const ad of availableDistributions) {
    // Used for exact matches
    const key = (ad.name+'-'+ad.version).toLowerCase()
    availableMap[key] = ad

    // if semver is invalid, skip
    if (!semver.valid(ad.version)) {
      continue
    }

    // Used for distro + semver matches
    const semverKey = (ad.name+'-'+semver.parse(ad.version)).toLowerCase()
    availableMap[semverKey] = ad

    // Used for distro + semver minor matches
    const semverMinorKey = (ad.name+'-'+semver.parse(ad.version).major+'.'+semver.parse(ad.version).minor).toLowerCase()
    if (availableMap[semverMinorKey]) {
      if (semver.gt(ad.version, availableMap[semverMinorKey].version)) {
        availableMap[semverMinorKey] = ad
      }
    } else {
      availableMap[semverMinorKey] = ad
    }

    // Used for distro + semver major matches
    const semverMajorKey = (ad.name+'-'+semver.parse(ad.version).major).toLowerCase()
    if (availableMap[semverMajorKey]) {
      if (semver.gt(ad.version, availableMap[semverMajorKey].version)) {
        availableMap[semverMajorKey] = ad
      }
    } else {
      availableMap[semverMajorKey] = ad
    }

  }
  for (const ud of usedDistributions) {
    // Exact match for distribution and version
    const key = (ud.k8sDistribution+'-'+ud.k8sVersion).toLowerCase()
    if (availableMap[key]) {
      const matrixKey = availableMap[key].name+'-'+availableMap[key].version
      matrixMap[matrixKey] = { distribution: availableMap[key].name, version: availableMap[key].version }
      continue
    }

    // if semver is invalid, skip
    if (!semver.valid(ud.k8sVersion)) {
      continue
    }

    // Exact match for distribution, but using semver
    const semverKey = (ud.k8sDistribution+'-'+semver.parse(ud.k8sVersion)).toLowerCase()
    if (availableMap[semverKey]) {
      const matrixKey = availableMap[semverKey].name+'-'+availableMap[semverKey].version
      matrixMap[matrixKey] = { distribution: availableMap[semverKey].name, version: availableMap[semverKey].version }
      continue
    }

    // Exact match for distribution, but using up to minor version
    const semverMinorKey = (ud.k8sDistribution+'-'+semver.parse(ud.k8sVersion).major+'.'+semver.parse(ud.k8sVersion).minor).toLowerCase()
    if (availableMap[semverMinorKey]) {
      const matrixKey = availableMap[semverMinorKey].name+'-'+availableMap[semverMinorKey].version
      matrixMap[matrixKey] = { distribution: availableMap[semverMinorKey].name, version: availableMap[semverMinorKey].version }
      continue
    }

    // Exact match for distribution, but using up to major version
    const semverMajorKey = (ud.k8sDistribution+'-'+semver.parse(ud.k8sVersion).major).toLowerCase()
    if (availableMap[semverMajorKey]) {
      const matrixKey = availableMap[semverMajorKey].name+'-'+availableMap[semverMajorKey].version
      matrixMap[matrixKey] = { distribution: availableMap[semverMajorKey].name, version: availableMap[semverMajorKey].version }
      continue
    }
  }

  const matrix: MatrixInstance[] =  Object.values(matrixMap).map((value) => {
    return value;
  });
  return matrix
}

run()