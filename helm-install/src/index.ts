import * as core from '@actions/core';
import { installChart, login, templateChart } from './helm';
import { file } from 'tmp-promise';
import * as fs from 'fs';
import { downloadPreflight, runPreflight } from './preflight';

async function run() {
  const helmPath: string = core.getInput('helm-path');
  const kubeconfig: string = core.getInput('kubeconfig');
  const namespace: string = core.getInput('namespace');
  const registryUsername: string = core.getInput('registry-username');
  const registryPassword: string = core.getInput('registry-password');
  const runPreflights: boolean = core.getInput('run-preflights') === 'true';
  const values: string = core.getInput('values');
  const chart: string = core.getInput('chart');
  const version: string = core.getInput('version');
  const name: string = core.getInput('name');

  // Write the values
  let valuesFilePath = '';
  if (values) {
    const {fd, path: valuesPath, cleanup: cleanupValues} = await file({postfix: '.yaml'});
    fs.writeFileSync(valuesPath, values);
    valuesFilePath = valuesPath;
  }
  
  // registry login
  await login(helmPath, registryUsername, registryPassword, chart);

  if (runPreflights) {
    // install troubleshoot.sh preflight kubectl plugin
    const preflightPath: string = await downloadPreflight();

    // run preflight checks
    const templatedChart: string = await templateChart(helmPath, chart, version, valuesFilePath);
    await runPreflight(preflightPath, kubeconfig, templatedChart)
  }

  await installChart(helmPath, kubeconfig, chart, version, name, namespace, valuesFilePath);
}

run()

