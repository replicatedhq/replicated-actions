import * as core from '@actions/core';
import { archiveCustomer } from 'replicated-lib';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const apiToken = core.getInput('replicated-api-token')
    const appSlug = core.getInput('app-slug')
    const customerId = core.getInput('customer-id')
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    await archiveCustomer(apiClient, customerId)

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()