import * as core from '@actions/core';
import { VendorPortalApi, Channel, createChannel, getApplicationDetails } from 'replicated-lib';
import * as httpClient from '@actions/http-client';

async function listChannels(apiClient: VendorPortalApi, appId: string): Promise<Channel[]> {
  const http = new httpClient.HttpClient('replicated-actions');
  // API endpoint format: https://api.replicated.com/vendor/v3
  // List channels: GET /app/{app_id}/channels
  const listChannelsUri = `${apiClient.endpoint}/app/${appId}/channels?excludeDetail=true`;
  
  const res = await http.get(listChannelsUri, {
    'Authorization': `Bearer ${apiClient.apiToken}`
  });
  
  if (res.message.statusCode !== 200) {
    const body = await res.readBody();
    throw new Error(`Failed to list channels: Server responded with ${res.message.statusCode}: ${body}`);
  }
  
  const body = await res.readBody();
  const data = JSON.parse(body);
  return data.channels || [];
}

export async function actionCreateChannel() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const channelName = core.getInput("channel-name", { required: true });
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    // Get app ID from app slug
    const app = await getApplicationDetails(apiClient, appSlug);
    
    // List channels to check if it exists
    const channels = await listChannels(apiClient, app.id);
    
    // Check if channel exists by name or slug
    const existingChannel = channels.find(
      (ch: Channel) => ch.name === channelName || ch.slug === channelName
    );
    
    let channel: Channel;
    if (existingChannel) {
      core.info(`Channel ${channelName} already exists (slug: ${existingChannel.slug})`);
      channel = existingChannel;
    } else {
      core.info(`Creating channel ${channelName}...`);
      channel = await createChannel(apiClient, appSlug, channelName);
      core.info(`Created channel ${channelName} (slug: ${channel.slug})`);
    }
    
    core.setOutput('channel-id', channel.id);
    core.setOutput('channel-slug', channel.slug);
    core.setOutput('channel-name', channel.name);
  } catch (error) {
    core.setFailed(error.message);
  }
}

