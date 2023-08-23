import * as core from '@actions/core';
import { VendorPortalApi, CompatibilityResult, reportCompatibilityResult} from 'replicated-lib';


async function run() {
  try {
    const appSlug = core.getInput('app-slug')
    const apiToken = core.getInput('api-token')
    const releaseSequence = core.getInput('release-sequence')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    const k8sDistribution = core.getInput('kubernetes-distribution');
    const k8sVersion = core.getInput('kubernetes-version');
    const successAt = core.getInput('success-at')
    const successNotes = core.getInput('success-notes')
    const failureAt = core.getInput('failure-at')
    const failureNotes = core.getInput('failure-notes')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    // both success and failure defined
    if (successAt && failureAt) {
      throw new Error("Cannot set both success and failure times")
    }
    
    // neither success or failure defined
    if (!successAt && !failureAt) {
      throw new Error("Must set either success or failure times")
    }

    const c11yResult : CompatibilityResult = {
      distribution: k8sDistribution,
      version: k8sVersion,
    }

    if (successAt) {
      c11yResult.successAt = new Date(successAt);
      c11yResult.successNotes = successNotes;
    }
    if (failureAt) {
      c11yResult.failureAt =  new Date(failureAt);
      c11yResult.failureNotes =  failureNotes;
    }

    await reportCompatibilityResult(apiClient, appSlug, +releaseSequence, c11yResult)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()