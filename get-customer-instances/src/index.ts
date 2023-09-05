import * as core from '@actions/core';
import * as semver from 'semver';
import { VendorPortalApi, ClusterVersion, KubernetesDistribution, getClusterVersions, getUsedKubernetesDistributions } from 'replicated-lib';


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
    const availableDistributions = await getClusterVersions(apiClient)

    const matrix = processDistributions(usedDistributions, availableDistributions)

    core.setOutput('matrix', JSON.stringify(matrix));

  } catch (error) {
    core.setFailed(error.message);
  }
}

function processDistributions(usedDistributions: KubernetesDistribution[], availableDistributions: ClusterVersion[]): MatrixInstance[] {
  const matrixMap: { [key: string]: MatrixInstance } = {}
  const availableMap: { [key: string]: ClusterVersion } = {}
  
  core.info(`Found ${availableDistributions.length} available distributions`)
  core.info(`Found ${usedDistributions.length} used distributions`)
  
  for (const ad of availableDistributions) {
    // Used for exact matches
    const key = (ad.name+'-'+ad.version).toLowerCase()
    availableMap[key] = ad

    // if semver is invalid, skip
    const sversion: semver = semver.coerce(ad.version)
    if (!sversion) {
      core.info(`Available distribution ${ad.name} has invalid semver ${ad.version}`)
      continue
    }

    // Used for distro + semver matches
    const semverKey = (ad.name+'-'+sversion).toLowerCase()
    availableMap[semverKey] = ad

    // Used for distro + semver minor matches
    const semverMinorKey = (ad.name+'-'+sversion.major+'.'+sversion.minor).toLowerCase()
    if (availableMap[semverMinorKey]) {
      if (semver.gt(sversion, semver.coerce(availableMap[semverMinorKey].version))) {
        availableMap[semverMinorKey] = ad
      }
    } else {
      availableMap[semverMinorKey] = ad
    }

    // Used for distro + semver major matches
    const semverMajorKey = (ad.name+'-'+sversion.major).toLowerCase()
    if (availableMap[semverMajorKey]) {
      if (semver.gt(sversion, semver.coerce(availableMap[semverMajorKey].version))) {
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
    const sversion: semver = semver.coerce(ud.k8sVersion)
    if (!sversion) {
      core.info(`Used distribution ${ud.k8sDistribution} has invalid semver ${ud.k8sVersion}`)
      continue
    }

    // Exact match for distribution, but using semver
    const semverKey = (ud.k8sDistribution+'-'+sversion).toLowerCase()
    if (availableMap[semverKey]) {
      const matrixKey = availableMap[semverKey].name+'-'+availableMap[semverKey].version
      matrixMap[matrixKey] = { distribution: availableMap[semverKey].name, version: availableMap[semverKey].version }
      continue
    }

    // Exact match for distribution, but using up to minor version
    const semverMinorKey = (ud.k8sDistribution+'-'+sversion.major+'.'+sversion.minor).toLowerCase()
    if (availableMap[semverMinorKey]) {
      const matrixKey = availableMap[semverMinorKey].name+'-'+availableMap[semverMinorKey].version
      matrixMap[matrixKey] = { distribution: availableMap[semverMinorKey].name, version: availableMap[semverMinorKey].version }
      continue
    }

    // Exact match for distribution, but using up to major version
    const semverMajorKey = (ud.k8sDistribution+'-'+sversion.major).toLowerCase()
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