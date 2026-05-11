import * as core from "@actions/core";
import { VendorPortalApi, createChannel } from "replicated-lib";

export async function actionCreateChannel() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const channelName = core.getInput("channel-name", { required: true });
    const buildAirgapAutomatically = core.getBooleanInput("build-airgap-automatically");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    const channel = await createChannel(apiClient, appSlug, channelName, buildAirgapAutomatically);
    core.info(`Created channel ${channel.name} (${channel.slug}) for app ${appSlug}`);
    core.setOutput("channel-id", channel.id);
    core.setOutput("channel-slug", channel.slug);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(message);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
    core.setFailed(message);
  }
}
