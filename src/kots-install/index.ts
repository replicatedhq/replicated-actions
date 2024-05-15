import * as core from '@actions/core';
import { downloadKots, installApp } from './kots';
import { file } from 'tmp-promise';
import * as fs from 'fs';

export async function actionKotsInstall() {
  const licenseFileInput = core.getInput('license-file')
  let licenseFilePath = '';
  if (fs.existsSync(licenseFileInput)) {
    licenseFilePath = licenseFileInput;
  } else {
    const {path: licensePath} = await file({postfix: '.yaml'});
    fs.writeFileSync(licensePath, licenseFileInput);
    licenseFilePath = licensePath;
  }

  const configValuesInput = core.getInput('config-values')
  let valuesFilePath = '';
  if (configValuesInput) {
    if (fs.existsSync(configValuesInput)) {
      valuesFilePath = configValuesInput;
    } else {
      const {path: valuesPath} = await file({postfix: '.yaml'});
      fs.writeFileSync(valuesPath, core.getInput('config-values'));
      valuesFilePath = valuesPath;
    }
  }

  const kostPath: string = await downloadKots(core.getInput('kots-version'));
  await installApp(kostPath, licenseFilePath, valuesFilePath);
}
