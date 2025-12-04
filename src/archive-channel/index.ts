import * as core from "@actions/core";
import { VendorPortalApi, archiveChannel } from "replicated-lib";

export async function actionArchiveChannel() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const channelSlug = core.getInput("channel-slug", { required: true });
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    await archiveChannel(apiClient, appSlug, channelSlug);
    core.info(`Archived channel ${channelSlug} for app ${appSlug}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
