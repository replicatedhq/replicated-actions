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
    const success = core.getBooleanInput('success');
    const notes = core.getInput('notes');
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const c11yResult : CompatibilityResult = {
      distribution: k8sDistribution,
      version: k8sVersion,
    }

    const now = new Date();
    if (success) {
      c11yResult.successAt = now;
      if (notes) {
        c11yResult.successNotes = notes;
      }
    } else {
        c11yResult.failureAt = now;
        if (notes) {
          c11yResult.failureNotes = notes;
        }
      }

    await reportCompatibilityResult(apiClient, appSlug, +releaseSequence, c11yResult)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()