import * as core from '@actions/core';
import { installChart, login } from './helm';
import { file } from 'tmp-promise';
import * as fs from 'fs';

async function run() {
  // Write the values
  let valuesFilePath = '';
  if (core.getInput('values')) {
    const {fd, path: valuesPath, cleanup: cleanupValues} = await file({postfix: '.yaml'});
    fs.writeFileSync(valuesPath, core.getInput('values'));
    valuesFilePath = valuesPath;
  }

  await login(core.getInput('helm-path'), core.getInput('registry-username'), core.getInput('registry-password'));
  await installChart(core.getInput('helm-path'), valuesFilePath);

  // cleanupLicense();
}

run()

