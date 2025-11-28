import * as core from '@actions/core';
import { VendorPortalApi, archiveCustomer, listCustomersByName } from 'replicated-lib';

export async function actionArchiveCustomer() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const customerId = core.getInput("customer-id");
    const customerName = core.getInput("customer-name");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    
    // Validate that at least one identifier is provided
    if (!customerId && !customerName) {
      throw new Error("Either customer-id or customer-name must be provided");
    }

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    let resolvedCustomerId: string;

    if (customerId) {
      // Use provided customer ID directly
      resolvedCustomerId = customerId;
    } else if (customerName) {
      // Look up customer by name
      const customers = await listCustomersByName(apiClient, appSlug, customerName);
      
      if (customers.length === 0) {
        throw new Error(`No customer found with name "${customerName}"`);
      }
      
      if (customers.length > 1) {
        throw new Error(`Multiple customers found with name "${customerName}". Please use customer-id instead. Found ${customers.length} customers.`);
      }
      
      resolvedCustomerId = customers[0].customerId;
      core.info(`Resolved customer name "${customerName}" to customer ID ${resolvedCustomerId}`);
    } else {
      // This should never happen due to the check above, but TypeScript needs this
      throw new Error("Either customer-id or customer-name must be provided");
    }

    await archiveCustomer(apiClient, resolvedCustomerId)
    core.info(`Archived customer ${resolvedCustomerId}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
