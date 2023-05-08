import * as core from '@actions/core';
import { createCustomer } from 'replicated-lib';
import { VendorPortalApi } from 'replicated-lib/dist/configuration';


async function run() {
  try {
    const appSlug = core.getInput('replicated-app');
    const apiToken = core.getInput('replicated-api-token')
    const name = core.getInput('customer-name');
    const email = core.getInput('customer-email');
    const licenseType = core.getInput('customer-license-type');
    const channelName = core.getInput('channel-name');

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    const customer = await createCustomer(apiClient, appSlug, name, email, licenseType, channelName);

    core.setOutput('customer-id', customer.customerId);
    core.setOutput('customer-name', customer.name);
    core.setOutput('license-id', customer.licenseId);

  } catch (error) {
    core.setFailed(error.message);
  }
}


run()