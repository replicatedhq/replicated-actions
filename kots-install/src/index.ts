import * as core from '@actions/core';
import { downloadKots, installApp } from './kots';
import { file } from 'tmp-promise';
import * as fs from 'fs';

async function run() {

  let licenseFilePath = '';
  if (core.getInput('license-file')) {
    // Write the license
    const {path: licensePath} = await file({postfix: '.yaml'});
    fs.writeFileSync(licensePath, core.getInput('license-file'));
    licenseFilePath = licensePath;
  } else {
    // Fall back to the license file path
    licenseFilePath = core.getInput('license-file-path');
  }

  // License file is required for an automated install
  if (!licenseFilePath) {
    core.setFailed('No license file provided. Please provide a license-file or a license-file-path.');
    return;
  }

  let valuesFilePath = '';
  if (core.getInput('config-values')) {
    // Write the values if any
    const {path: valuesPath} = await file({postfix: '.yaml'});
    fs.writeFileSync(valuesPath, core.getInput('config-values'));
    valuesFilePath = valuesPath;
  } else {
    // Fall back to the values file path
    valuesFilePath = core.getInput('config-values-path');
  }



  const kostPath: string = await downloadKots(core.getInput('kots-version'));
  await installApp(kostPath, licenseFilePath, valuesFilePath);

}

run()

