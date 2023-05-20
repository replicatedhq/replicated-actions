import * as core from '@actions/core';
import { downloadKots, installApp } from './kots';
import { file } from 'tmp-promise';
import * as fs from 'fs';

async function run() {

  // Write the license
  let licenseFilePath = '';
  const {fd, path: licensePath, cleanup: cleanupValues} = await file({postfix: '.yaml'});
  fs.writeFileSync(licensePath, core.getInput('license-file'));
  licenseFilePath = licensePath;

  // Write the values if any
  let valuesFilePath = '';
  if (core.getInput('config-values')) {
    const {fd, path: valuesPath, cleanup: cleanupValues} = await file({postfix: '.yaml'});
    fs.writeFileSync(valuesPath, core.getInput('config-values'));
    valuesFilePath = valuesPath;
  }



  const kostPath: string = await downloadKots(core.getInput('kots-version'));
  await installApp(kostPath, licenseFilePath, valuesFilePath);

}

run()

