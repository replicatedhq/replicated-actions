import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as fs from "fs";
import * as tmpPromise from "tmp-promise";
import * as url from "url";

export async function repoAdd(
  helmPath: string,
  repoName: string,
  repoUrl: string
) {
  try {
    const params: string[] = ["repo", "add", repoName, repoUrl];

    await exec.exec(helmPath, params);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function login(
  helmPath: string,
  username: string,
  password: string,
  chart: string
) {
  try {
    if (!username || !password) {
      core.info("No username or password provided, skipping login");
      return;
    }

    const parsed = url.parse(chart);

    const loginOptions: exec.ExecOptions = {};

    const hostname: string = parsed.hostname || "";
    const params: string[] = [
      "registry",
      "login",
      hostname,
      "--username",
      username,
      "--password",
      password,
    ];

    await exec.exec(helmPath, params, loginOptions);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function installChart(
  helmPath: string,
  kubeconfig: string,
  chart: string,
  version: string,
  releaseName: string,
  namespace: string,
  valuesPath: string
) {
  try {
    // write the kubeconfig to a temp file
    const {
      fd,
      path: kubeconfigPath,
      cleanup,
    } = await tmpPromise.file({ postfix: ".yaml" });
    fs.writeFileSync(kubeconfigPath, kubeconfig);

    const installOptions: exec.ExecOptions = {};

    const params = [
      "upgrade",
      releaseName,
      "--install",
      "--kubeconfig",
      kubeconfigPath,
      "--namespace",
      namespace,
      "--create-namespace",
      chart,
    ];

    if (version) {
      params.push(`--version`, version);
    }
    if (valuesPath !== "") {
      params.push("--values", valuesPath);
    }

    await exec.exec(helmPath, params, installOptions);
    cleanup();
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function templateChart(
  helmPath: string,
  chart: string,
  version: string,
  valuesPath: string
): Promise<string> {
  try {
    let templateOutput: string = "";
    const { path: tmpDir, cleanup } = await tmpPromise.dir({
      unsafeCleanup: true,
    });

    const installOptions: exec.ExecOptions = {};
    installOptions.silent = true;
    installOptions.listeners = {
      stdout: (data: Buffer) => {
        templateOutput += data.toString();
      },
      stderr: (data: Buffer) => {
        core.info(data.toString());
      },
    };

    const params = ["template", chart];

    if (version) {
      params.push(`--version`, version);
    }

    if (valuesPath !== "") {
      params.push("--values", valuesPath);
    }

    await exec.exec(helmPath, params, installOptions);
    cleanup();
    return templateOutput;
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}
