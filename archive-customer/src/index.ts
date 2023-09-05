import * as core from '@actions/core';
import { VendorPortalApi, archiveCustomer } from 'replicated-lib';


async function run() {
  try {
    const apiToken = core.getInput('api-token')
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