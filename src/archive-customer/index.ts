import * as core from '@actions/core';
import { VendorPortalApi, archiveCustomer, listCustomersByName } from 'replicated-lib';

export async function actionArchiveCustomer() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const customerId = core.getInput("customer-id");
    const customerName = core.getInput("customer-name");
    const appSlug = core.getInput("app-slug");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    
    // Fail if neither customer-id nor customer-name are provided
    if (!customerId && !customerName) {
      throw new Error("Either customer-id or customer-name must be provided");
    }

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    // If customer-id is not provided, look it up by name
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && customerName) {
      const customers = await listCustomersByName(apiClient, appSlug || undefined, customerName);
      
      if (customers.length === 0) {
        throw new Error(`No customer found with name "${customerName}"${appSlug ? ` and app-slug "${appSlug}"` : ''}`);
      }
      
      if (customers.length > 1) {
        throw new Error(`Multiple customers found with name "${customerName}"${appSlug ? ` and app-slug "${appSlug}"` : ''}. Please provide customer-id or app-slug to narrow down the search.`);
      }
      
      resolvedCustomerId = customers[0].customerId;
      core.info(`Found customer "${customerName}" with id ${resolvedCustomerId}`);
    }

    await archiveCustomer(apiClient, resolvedCustomerId!)
    core.info(`Archived customer ${resolvedCustomerId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
