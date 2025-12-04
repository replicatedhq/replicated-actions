import * as core from "@actions/core";
import { VendorPortalApi, createCustomer, listCustomersByName, getApplicationDetails } from "replicated-lib";

import { parse } from "yaml";

export async function actionCreateCustomer() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const name = core.getInput("customer-name", { required: true });
    const email = core.getInput("customer-email");
    const licenseType = core.getInput("license-type") || "dev";
    const channelSlug = core.getInput("channel-slug");
    const expiresInDays: number = +(core.getInput("expires-in") || 0);
    const entitlements = core.getInput("entitlements");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    // The default for isKotsInstallEnabled is undefined, which means it will not be set
    // As such we can not use core.getBooleanInput
    let isKotsInstallEnabled: boolean | undefined = undefined;
    if (core.getInput("is-kots-install-enabled") !== "") {
      isKotsInstallEnabled = core.getInput("is-kots-install-enabled") === "true";
    }

    let isDevModeEnabled: boolean | undefined = undefined;
    if (core.getInput("is-dev-mode-enabled") !== "") {
      isDevModeEnabled = core.getInput("is-dev-mode-enabled") === "true";
    }

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    // Search for existing customers with the same name and app-slug
    const existingCustomers = await listCustomersByName(apiClient, appSlug, name);

    if (existingCustomers.length > 1) {
      throw new Error(`Multiple customers found with name "${name}" and app-slug "${appSlug}". Cannot determine which customer to use.`);
    }

    if (existingCustomers.length === 1) {
      const existingCustomerId = existingCustomers[0].customerId;
      core.info(`Found existing customer "${name}" with id ${existingCustomerId}`);

      // Get customer details to compare settings
      const customerDetails = await getCustomerDetails(apiClient, appSlug, existingCustomerId);

      // Compare settings
      const mismatches: string[] = [];

      if (customerDetails.email !== email) {
        mismatches.push(`email: existing="${customerDetails.email || "(empty)"}", requested="${email || "(empty)"}"`);
      }

      if (customerDetails.licenseType !== licenseType) {
        mismatches.push(`license-type: existing="${customerDetails.licenseType}", requested="${licenseType}"`);
      }

      // Check if requested channel is in the customer's channel list
      // If no channel requested, check if customer has no channels
      if (channelSlug) {
        if (!customerDetails.channelSlugs.includes(channelSlug)) {
          mismatches.push(`channel-slug: requested channel "${channelSlug}" is not in customer's channel list: [${customerDetails.channelSlugs.join(", ") || "none"}]`);
        }
      } else {
        // If no channel requested but customer has channels, that's okay (customer can have channels)
        // But if customer has no channels and we're requesting none, that's also okay
        // So we don't need to check this case
      }

      // Compare expiration - if requested expires-in is 0, check if existing also never expires
      // If requested expires-in > 0, check if existing also has an expiration date set
      // Note: We can't compare exact expiration dates since they're calculated from creation time
      const requestedNeverExpires = expiresInDays <= 0;
      const existingNeverExpires = customerDetails.expiresAt === null;
      if (requestedNeverExpires !== existingNeverExpires) {
        mismatches.push(`expires-in: existing="${existingNeverExpires ? "never" : "has expiration date"}", requested="${requestedNeverExpires ? "never" : `${expiresInDays} days`}"`);
      }

      // Compare entitlements
      const requestedEntitlements = processEntitlements(entitlements);
      if (!entitlementsMatch(customerDetails.entitlements, requestedEntitlements)) {
        mismatches.push(`entitlements: existing="${JSON.stringify(customerDetails.entitlements || [])}", requested="${JSON.stringify(requestedEntitlements || [])}"`);
      }

      if (customerDetails.isKotsInstallEnabled !== isKotsInstallEnabled) {
        mismatches.push(`is-kots-install-enabled: existing="${customerDetails.isKotsInstallEnabled}", requested="${isKotsInstallEnabled}"`);
      }

      if (customerDetails.isDevModeEnabled !== isDevModeEnabled) {
        mismatches.push(`is-dev-mode-enabled: existing="${customerDetails.isDevModeEnabled}", requested="${isDevModeEnabled}"`);
      }

      if (mismatches.length > 0) {
        throw new Error(`Customer "${name}" already exists with id ${existingCustomerId}, but settings do not match:\n${mismatches.map(m => `  - ${m}`).join("\n")}`);
      }

      // Settings match, return existing customer info
      core.info(`Existing customer settings match. Returning existing customer information.`);

      // Download license file
      const http = await apiClient.client();
      const app = await getApplicationDetails(apiClient, appSlug);
      const downloadLicenseUri = `${apiClient.endpoint}/app/${app.id}/customer/${existingCustomerId}/license-download`;
      const downloadLicenseRes = await http.get(downloadLicenseUri);

      if (downloadLicenseRes.message.statusCode !== 200 && downloadLicenseRes.message.statusCode !== 403) {
        await downloadLicenseRes.readBody();
        throw new Error(`Failed to download license: Server responded with ${downloadLicenseRes.message.statusCode}`);
      }

      let licenseFile = "";
      if (downloadLicenseRes.message.statusCode === 200) {
        licenseFile = await downloadLicenseRes.readBody();
      }

      core.setOutput("customer-id", existingCustomerId);
      core.setOutput("license-id", customerDetails.licenseId);
      core.setOutput("license-file", licenseFile);
      return;
    }

    // No existing customer found, create new one
    const entitlementsArray = processEntitlements(entitlements);
    const customer = await createCustomer(apiClient, appSlug, name, email, licenseType, channelSlug, expiresInDays, entitlementsArray, isKotsInstallEnabled, isDevModeEnabled);

    core.setOutput("customer-id", customer.customerId);
    core.setOutput("license-id", customer.licenseId);
    core.setOutput("license-file", customer.license);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getCustomerDetails(
  apiClient: VendorPortalApi,
  appSlug: string,
  customerId: string
): Promise<{
  email: string | undefined;
  licenseType: string;
  channelSlugs: string[];
  expiresAt: string | null;
  entitlements: Array<{ name: string; value: string }> | undefined;
  isKotsInstallEnabled: boolean | undefined;
  isDevModeEnabled: boolean | undefined;
  licenseId: string;
}> {
  const http = await apiClient.client();

  // According to API docs, GET /customer/{customer_id} includes license information
  // See: https://replicated-vendor-api.readme.io/reference/getcustomer
  const customerUri = `${apiClient.endpoint}/customer/${customerId}`;
  const customerRes = await http.get(customerUri);

  if (customerRes.message.statusCode !== 200) {
    const body = await customerRes.readBody();
    throw new Error(`Failed to get customer details: Server responded with ${customerRes.message.statusCode}: ${body}`);
  }

  const customerBody = JSON.parse(await customerRes.readBody());
  const customer = customerBody.customer;

  // Get license type from customer.type
  const licenseType = customer.type || "dev";

  // Extract other license information from license object for comparison
  const license = customer.license || customerBody.license;

  // Get all channel slugs from customer.channels array
  const channelSlugs: string[] = [];
  if (customer.channels && Array.isArray(customer.channels)) {
    customer.channels.forEach((channel: any) => {
      if (channel.channelSlug) {
        channelSlugs.push(channel.channelSlug);
      }
    });
  }

  let expiresAt: string | null = null;
  let entitlements: Array<{ name: string; value: string }> | undefined = undefined;
  let isKotsInstallEnabled: boolean | undefined = undefined;
  let isDevModeEnabled: boolean | undefined = undefined;
  let licenseId: string | undefined = undefined;

  // Extract other license fields from license object if present
  if (license) {
    if (license.installation_id) {
      licenseId = license.installation_id;
    }

    if (license.expires_at) {
      expiresAt = license.expires_at;
    }

    if (license.entitlement_values) {
      entitlements = Object.entries(license.entitlement_values).map(([name, value]) => ({
        name,
        value: String(value)
      }));
    }

    isKotsInstallEnabled = license.is_kots_install_enabled;
    isDevModeEnabled = license.is_dev_mode_enabled;
  }

  if (!licenseId) {
    throw new Error(`License ID not found in customer response for customer ${customerId}`);
  }

  return {
    email: customer.email,
    licenseType,
    channelSlugs,
    expiresAt,
    entitlements,
    isKotsInstallEnabled,
    isDevModeEnabled,
    licenseId
  };
}

function entitlementsMatch(existing: Array<{ name: string; value: string }> | undefined, requested: Array<{ name: string; value: string }> | undefined): boolean {
  // Normalize undefined to empty array
  const existingEntitlements = existing || [];
  const requestedEntitlements = requested || [];

  // If both are empty, they match
  if (existingEntitlements.length === 0 && requestedEntitlements.length === 0) {
    return true;
  }

  // If lengths differ, they don't match
  if (existingEntitlements.length !== requestedEntitlements.length) {
    return false;
  }

  // Sort both arrays by name for comparison
  const sortedExisting = [...existingEntitlements].sort((a, b) => a.name.localeCompare(b.name));
  const sortedRequested = [...requestedEntitlements].sort((a, b) => a.name.localeCompare(b.name));

  // Compare each entitlement
  for (let i = 0; i < sortedExisting.length; i++) {
    if (sortedExisting[i].name !== sortedRequested[i].name || sortedExisting[i].value !== sortedRequested[i].value) {
      return false;
    }
  }

  return true;
}

function processEntitlements(entitlements: string): Array<{ name: string; value: string }> | undefined {
  if (entitlements) {
    const entitlementsYAML = parse(entitlements);

    // for each entitlement in entitlementsYAML, convert to json and add to array
    const entitlementsArray = entitlementsYAML.map((entitlement: any) => {
      return { name: entitlement.name, value: entitlement.value };
    });
    return entitlementsArray;
  }
  return undefined;
}
