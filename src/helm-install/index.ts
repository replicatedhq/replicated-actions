import * as core from "@actions/core";
import { installChart, login, repoAdd, templateChart } from "./helm";
import { file } from "tmp-promise";
import * as fs from "fs";
import { downloadPreflight, runPreflight } from "./preflight";

export async function actionHelmInstall() {
  const helmPath: string = core.getInput("helm-path", { required: true });
  const kubeconfig: string = core.getInput("kubeconfig", { required: true });
  const namespace: string = core.getInput("namespace", { required: true }) || "default";
  const registryUsername: string = core.getInput("registry-username");
  const registryPassword: string = core.getInput("registry-password");
  const runPreflights: boolean = core.getBooleanInput("run-preflights");
  const values: string = core.getInput("values");
  const repoName: string = core.getInput("repo-name");
  const repoUrl: string = core.getInput("repo-url");
  const chart: string = core.getInput("chart", { required: true });
  const version: string = core.getInput("version");
  const name: string = core.getInput("name", { required: true });

  // Write the values
  let valuesFilePath = "";
  if (values) {
    const { fd, path: valuesPath, cleanup: cleanupValues } = await file({ postfix: ".yaml" });
    fs.writeFileSync(valuesPath, values);
    valuesFilePath = valuesPath;
  }

  // if there's a repo, this is not a oci or local chart
  if (repoName && repoUrl) {
    await repoAdd(helmPath, repoName, repoUrl);
  }

  // registry login
  await login(helmPath, registryUsername, registryPassword, chart);

  if (runPreflights) {
    // install troubleshoot.sh preflight kubectl plugin
    const preflightPath: string = await downloadPreflight();

    // run preflight checks
    const templatedChart: string = await templateChart(helmPath, chart, version, valuesFilePath);
    await runPreflight(preflightPath, kubeconfig, templatedChart);
  }

  await installChart(helmPath, kubeconfig, chart, version, name, namespace, valuesFilePath);
}
