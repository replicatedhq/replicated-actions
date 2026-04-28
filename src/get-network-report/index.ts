import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import { VendorPortalApi, getNetworkReport, getNetworkReportSummary } from "replicated-lib";

const MAX_VARIABLE_SIZE_BYTES = 1024 * 1024; // GitHub Actions output variable cap

export async function actionGetNetworkReport() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const networkId = core.getInput("network-id", { required: true });
    const mode = core.getInput("mode", { required: true });
    const summaryFilePath = core.getInput("summary-file-path");
    const eventsFilePath = core.getInput("events-file-path");
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    if (mode !== "summary" && mode !== "events" && mode !== "all") {
      throw new Error(`Invalid mode '${mode}'. Must be 'summary', 'events', or 'all'.`);
    }
    const wantSummary = mode === "summary" || mode === "all";
    const wantEvents = mode === "events" || mode === "all";

    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;
    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint;
    }

    if (wantSummary) {
      const summary = await getNetworkReportSummary(apiClient, networkId);
      const json = JSON.stringify(summary);
      if (summaryFilePath) {
        writeFile(summaryFilePath, json);
        core.info(`Wrote summary to ${summaryFilePath}`);
        core.setOutput("summary-file", summaryFilePath);
      } else {
        core.setOutput("summary", json);
      }
    }

    if (wantEvents) {
      const report = await getNetworkReport(apiClient, networkId);
      const json = JSON.stringify(report.events);
      if (eventsFilePath) {
        writeFile(eventsFilePath, json);
        core.info(`Wrote events to ${eventsFilePath}`);
        core.setOutput("events-file", eventsFilePath);
      } else {
        const size = Buffer.byteLength(json, "utf8");
        if (size > MAX_VARIABLE_SIZE_BYTES) {
          throw new Error(`Events output size (${size} bytes) exceeds the 1MB limit for action output variables. Use 'events-file-path' to write the events to disk instead.`);
        }
        core.setOutput("events", json);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(message);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
    core.setFailed(message);
  }
}

function writeFile(filePath: string, contents: string) {
  const directoryPath = path.dirname(filePath);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  fs.writeFileSync(filePath, contents);
}
