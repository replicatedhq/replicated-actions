import * as core from '@actions/core';
import { downloadKots, installApp, installAppOptions } from './kots';
import { file } from 'tmp-promise';
import * as fs from 'fs';

export async function actionKotsInstall() {
  const licenseFileInput = core.getInput("license-file", { required: true });
  const kotsVersionInput = core.getInput("kots-version", { required: true }) || "latest";
  const configValuesInput = core.getInput("config-values");
  const kubeconfigInput = core.getInput("kubeconfig", { required: true });
  const appSlugInput = core.getInput("app-slug", { required: true });
  const appVersionLabelInput = core.getInput("app-version-label");
  const namespaceInput = core.getInput("namespace") || "default";
  const waitDurationInput = core.getInput("wait-duration");
  const sharedPasswordInput: string = core.getInput("shared-password");
  const storageClassInput = core.getInput("storage-class");

  let licenseFilePath = '';
  if (fs.existsSync(licenseFileInput)) {
    licenseFilePath = licenseFileInput;
  } else {
    const {path: licensePath} = await file({postfix: '.yaml'});
    fs.writeFileSync(licensePath, licenseFileInput);
    licenseFilePath = licensePath;
  }

  let valuesFilePath = '';
  if (configValuesInput) {
    if (fs.existsSync(configValuesInput)) {
      valuesFilePath = configValuesInput;
    } else {
      const {path: valuesPath} = await file({postfix: '.yaml'});
      fs.writeFileSync(valuesPath, configValuesInput);
      valuesFilePath = valuesPath;
    }
  }

  const kostPath: string = await downloadKots(kotsVersionInput);

  const opts: installAppOptions = {
    kubeconfig: kubeconfigInput,
    appSlug: appSlugInput,
    namespace: namespaceInput,
    sharedPassword: sharedPasswordInput,
    appVersionLabel: appVersionLabelInput,
    waitDuration: waitDurationInput,
    storageClass: storageClassInput,
  };
  await installApp(kostPath, licenseFilePath, valuesFilePath, opts);
}
