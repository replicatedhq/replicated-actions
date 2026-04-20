import * as core from "@actions/core";
import { VendorPortalApi, createCustomer, CreateCustomerOptions } from "replicated-lib";

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
    const customId = core.getInput("custom-id");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    const entitlementsArray = processEntitlements(entitlements);

    const options: CreateCustomerOptions = {
      appSlug,
      name,
      licenseType,
      email,
      channelSlug,
      expiresIn: expiresInDays,
      entitlementValues: entitlementsArray,
      customId: customId || undefined,
      isKotsInstallEnabled: optionalBooleanInput("is-kots-install-enabled"),
      isDevModeEnabled: optionalBooleanInput("is-dev-mode-enabled"),
      isAirgapEnabled: optionalBooleanInput("is-airgap-enabled"),
      isGitopsSupported: optionalBooleanInput("is-gitops-supported"),
      isSnapshotSupported: optionalBooleanInput("is-snapshot-supported"),
      isHelmInstallEnabled: optionalBooleanInput("is-helm-install-enabled"),
      isKurlInstallEnabled: optionalBooleanInput("is-kurl-install-enabled"),
      isEmbeddedClusterDownloadEnabled: optionalBooleanInput("is-embedded-cluster-download-enabled"),
      isEmbeddedClusterMultinodeEnabled: optionalBooleanInput("is-embedded-cluster-multinode-enabled"),
      isGeoaxisSupported: optionalBooleanInput("is-geoaxis-supported"),
      isIdentityServiceSupported: optionalBooleanInput("is-identity-service-supported"),
      isInstallerSupportEnabled: optionalBooleanInput("is-installer-support-enabled"),
      isSupportBundleUploadEnabled: optionalBooleanInput("is-support-bundle-upload-enabled")
    };

    const customer = await createCustomer(apiClient, options);

    core.setOutput("customer-id", customer.customerId);
    core.setOutput("license-id", customer.licenseId);
    core.setOutput("license-file", customer.license);
  } catch (error) {
    core.setFailed(error.message);
  }
}

// Returns undefined when the input isn't set, so the field is omitted from the API request.
function optionalBooleanInput(name: string): boolean | undefined {
  const value = core.getInput(name);
  if (value === "") {
    return undefined;
  }
  return value === "true";
}

function processEntitlements(entitlements: string): [] | undefined {
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
