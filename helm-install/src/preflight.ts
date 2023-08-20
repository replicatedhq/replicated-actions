import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as httpClient from '@actions/http-client';
import * as tmpPromise from 'tmp-promise';
import * as fs from 'fs';
import * as path from 'path';
import { file } from 'tmp-promise';

export async function downloadPreflight(): Promise<string> {
    try {
        core.info(`Downloading latest preflight`);
        const http = new httpClient.HttpClient();
        http.requestOptions = {
            allowRedirects: true
        };
        const uri = `https://github.com/replicatedhq/troubleshoot/releases/latest/download/preflight_linux_amd64.tar.gz`;
        const { fd , path: downloadPath , cleanup  } = await (0, tmpPromise.file)({
            postfix: '.tar.gz'
        });
        core.debug(`Downloading preflight binary to temp file at ${downloadPath}`);
        const f = fs.createWriteStream(downloadPath);
        const res = await http.get(uri);
        const preflightPath : Promise<string> = new Promise(async (resolve, reject)=>{
            core.info('Downloaded preflight binary');
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
                core.info('Extracted preflight archive');
                const preflightPath = path.resolve(path.join(path.dirname(downloadPath), 'preflight'));
                core.setOutput('preflight-path', preflightPath);
                resolve(preflightPath);
            });
        });
        return preflightPath;
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
  }

  export async function runPreflight(preflightPath: string, kubeconfig: string, inputDir: string) {
    try {
        // write the kubeconfig to a temp file
        const {fd: kubeconfgiFD, path: kubeconfigPath, cleanup: cleanupKubeconfig} = await file({postfix: '.yaml'});
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
        inputDir,
        '--kubeconfig',  kubeconfigPath,
        '--interactive=false',
        ];

        await exec.exec(preflightPath, params, installOptions);
        cleanupKubeconfig();

    } catch (error) {
        core.setFailed(error.message);
    }
  }