import * as core from '@actions/core';
import { VendorPortalApi, createCustomer } from 'replicated-lib';

import { parse } from 'yaml'

async function run() {
  try {
    const appSlug = core.getInput('app-slug');
    const apiToken = core.getInput('api-token')
    const name = core.getInput('customer-name');
    const email = core.getInput('customer-email');
    const licenseType = core.getInput('license-type');
    const channelSlug = core.getInput('channel-slug');
    const apiEndpoint = core.getInput('replicated-api-endpoint')
    const expiresInDays: number = +(core.getInput('expires-in') || 0);
    const entitlements = core.getInput('entitlements');
    const isKotsInstallEnabled = core.getBooleanInput('is-kots-install-enabled');
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const entitlementsArray = processEntitlements(entitlements)
    const customer = await createCustomer(apiClient, appSlug, name, email, licenseType, channelSlug, expiresInDays, entitlementsArray, isKotsInstallEnabled);

    core.setOutput('customer-id', customer.customerId);
    core.setOutput('license-id', customer.licenseId);
    core.setOutput('license-file', customer.license);

  } catch (error) {
    core.setFailed(error.message);
  }
}

function processEntitlements(entitlements: string): [] | undefined {
  if (entitlements) {
    const entitlementsYAML = parse(entitlements)
    
    // for each entitlement in entitlementsYAML, convert to json and add to array
    const entitlementsArray = entitlementsYAML.map((entitlement: any) => {
      return {name: entitlement.name, value: entitlement.value}
    })
    return entitlementsArray
  }
  return undefined
}

run()