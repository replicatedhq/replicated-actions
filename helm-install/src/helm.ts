import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as url from 'url';
import * as tmpPromise from 'tmp-promise';

export async function login(helmPath: string, username: string, password: string, chart: string) {
  try {
    if (!username || !password) {
      core.info('No username or password provided, skipping login');
      return;
    }

    const parsed = url.parse(chart);

    const loginOptions: any = {};
    loginOptions.listeners = {
      stdout: (data: Buffer) => {
        core.info(data.toString());
      },
      stderr: (data: Buffer) => {
        core.info(data.toString());
      }
    };

    const hostname: string = parsed.hostname || '';
    const params: string[] = [
      'registry',
      'login',
      hostname,
      '--username', username,
      '--password', password,
    ];

    await exec.exec(helmPath, params, loginOptions);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function installChart(helmPath: string, kubeconfig: string, chart: string, version: string, releaseName: string, namespace: string, valuesPath: string) {
  try {
    // write the kubeconfig to a temp file
    const {fd, path: kubeconfigPath, cleanup} = await tmpPromise.file({postfix: '.yaml'});
    fs.writeFileSync(kubeconfigPath, kubeconfig);

    const installOptions: any = {};
    installOptions.listeners = {
      stdout: (data: Buffer) => {
        core.info(data.toString());
      },
      stderr: (data: Buffer) => {
        core.info(data.toString());
      }
    };

    const params = [
      'install',
      releaseName,
      '--kubeconfig',  kubeconfigPath,
      '--namespace', namespace,
      '--create-namespace', chart,
    ];

    if (version) {
      params.push(`--version`, version);
    }
    if (valuesPath !== '') {
      params.push('--values', valuesPath);
    }

    await exec.exec(helmPath, params, installOptions);
    cleanup();
  } catch (error) {
    core.setFailed(error.message);
  }
}


export async function templateChart(helmPath: string, chart: string, version: string, valuesPath: string): Promise<string> {
  try {
    const installOptions: any = {};
    let templateOutput : string = '';
    const {path: tmpDir, cleanup} = await tmpPromise.dir( { unsafeCleanup: true });
    installOptions.listeners = {
      stdout: (data: Buffer) => {
        templateOutput += data.toString();
      },
      stderr: (data: Buffer) => {
        core.info(data.toString());
      }
    };

    const params = [
      'template',
      chart,
      '--output-dir', tmpDir,
    ];

    if (version) {
      params.push(`--version`, version);
    }

    if (valuesPath !== '') {
      params.push('--values', valuesPath);
    }

    await exec.exec(helmPath, params, installOptions);
    cleanup()
    return templateOutput;
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}