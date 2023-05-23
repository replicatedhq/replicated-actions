import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs';
import * as url from 'url';
import { file } from 'tmp-promise';

export async function login(helmPath: string, username: string, password: string) {
  try {
    if (!username || !password) {
      core.info('No username or password provided, skipping login');
      return;
    }

    const parsed = url.parse(core.getInput('chart'));

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

export async function installChart(helmPath: string, valuesPath: string) {
  try {
    const kubeconfig = core.getInput('kubeconfig');
    const namespace = core.getInput('namespace');

    // write the kubeconfig to a temp file
    const {fd, path: kubeconfigPath, cleanup} = await file({postfix: '.yaml'});
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
      `${core.getInput('name')}`,
      '--kubeconfig',  kubeconfigPath,
      '--namespace', core.getInput('namespace'),
      '--create-namespace',
      `${core.getInput('chart')}`,
      `--version`, `${core.getInput('version')}`,
    ];

    if (valuesPath !== '') {
      params.push('--values', valuesPath);
    }

    await exec.exec(helmPath, params, installOptions);
    cleanup();
  } catch (error) {
    core.setFailed(error.message);
  }
}
