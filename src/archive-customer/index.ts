import * as core from '@actions/core';
import { VendorPortalApi, archiveCustomer } from 'replicated-lib';

export async function actionArchiveCustomer() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const customerId = core.getInput("customer-id", { required: true });
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    await archiveCustomer(apiClient, customerId)
    core.info(`Archived customer ${customerId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
