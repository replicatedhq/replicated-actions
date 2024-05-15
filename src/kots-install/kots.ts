import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as httpClient from '@actions/http-client';
import * as fs from 'fs';
import * as tmpPromise from 'tmp-promise';
import * as path from 'path';
import * as randomstring from 'randomstring';


export async function downloadKots(version: string): Promise<string> {
  try {
      if (version === 'latest') {
          version = await getLatestKotsVersion();
      }
      core.info(`Downloading kots ${version}`);
      const http = new httpClient.HttpClient();
      http.requestOptions = {
          allowRedirects: true
      };
      const uri = `https://github.com/replicatedhq/kots/releases/download/${version}/kots_linux_amd64.tar.gz`;
      const { fd , path: downloadPath , cleanup  } = await (0, tmpPromise.file)({
          postfix: '.tar.gz'
      });
      core.debug(`Downloading kots binary to temp file at ${downloadPath}`);
      const f = fs.createWriteStream(downloadPath);
      const res = await http.get(uri);
      const kotsPath : Promise<string> = new Promise(async (resolve, reject)=>{
          core.info('Downloaded kots binary');
          res.message.pipe(f).on('close', async ()=>{
              let tarOutput, tarError = '';
              const tarOptions : any = {};
              tarOptions.listeners = {
                  stdout: (data)=>{
                      tarOutput += data.toString();
                  },
                  stderr: (data)=>{
                      tarError += data.toString();
                  }
              };
              tarOptions.cwd = path.dirname(downloadPath);
              await exec.exec('tar', [
                  'xzf',
                  downloadPath
              ], tarOptions);
              core.info('Extracted kots archive');
              const kotsPath = path.resolve(path.join(path.dirname(downloadPath), 'kots'));
              core.setOutput('kots-path', kotsPath);
              resolve(kotsPath);
          });
      });
      return kotsPath;
  } catch (error) {
      core.setFailed(error.message);
      throw error;
  }
}


async function getLatestKotsVersion() {
  try {
      const http = new httpClient.HttpClient();
      const res = await http.get(`https://kots.io/install?version`);
      if (res.message.statusCode != 200) {
          throw new Error(`Failed to get latest kots version: Server responded with ${res.message.statusCode}`);
      }
      const body = await res.readBody();
      return body;
  } catch (err) {
      core.setFailed(err.message);
      throw err;
  }
}

export async function installApp(kotsPath: string, licenseFilePath: string, configFilePath: string) {
  try {
      const kubeconfig = core.getInput('kubeconfig');
      const slug = core.getInput('app-slug');
      const appVersionLabel = core.getInput('app-version-label');
      const namespace = core.getInput('namespace');
      const waitDuration = core.getInput('wait-duration');
      // write the kubeconfig to a temp file
      const { fd , path: kubeconfigPath , cleanup  } = await (0, tmpPromise.file)({
          postfix: '.yaml'
      });
      fs.writeFileSync(kubeconfigPath, kubeconfig);
      const installOptions : exec.ExecOptions = {};

      // Allow configuring the shared password
      const sharedPassword: string = core.getInput('shared-password');
      let password: string;
      if (sharedPassword) {
        password = sharedPassword;
      } else {
        password = randomstring.generate(12);
      }

      const params = [
          'install',
          slug,
          "--namespace",
          namespace,
          "--shared-password",
          password,
          "--no-port-forward",
          "--skip-preflights"
      ];
      params.push("--license-file", licenseFilePath)
      params.push("--kubeconfig", kubeconfigPath)
      if (configFilePath !== '') {
        params.push("--config-values", configFilePath);
      }
      if (appVersionLabel) {
        params.push("--app-version-label", appVersionLabel);
      }
      if (waitDuration) {
        params.push("--wait-duration", waitDuration);
      }
      await exec.exec(kotsPath, params, installOptions);
      cleanup();
  } catch (error) {
      core.setFailed(error.message);
  }
}
