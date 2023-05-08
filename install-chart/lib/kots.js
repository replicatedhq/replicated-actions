"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    downloadKots: ()=>downloadKots,
    installApp: ()=>installApp
});
const _core = /*#__PURE__*/ _interopRequireWildcard(require("@actions/core"));
const _exec = /*#__PURE__*/ _interopRequireWildcard(require("@actions/exec"));
const _httpClient = /*#__PURE__*/ _interopRequireWildcard(require("@actions/http-client"));
const _fs = /*#__PURE__*/ _interopRequireWildcard(require("fs"));
const _tmpPromise = require("tmp-promise");
const _path = /*#__PURE__*/ _interopRequireWildcard(require("path"));
const _randomstring = /*#__PURE__*/ _interopRequireWildcard(require("randomstring"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function downloadKots(version) {
    try {
        if (version === 'latest') {
            version = await getLatestKotsVersion();
        }
        _core.info(`Downloading kots ${version}`);
        const http = new _httpClient.HttpClient();
        http.requestOptions = {
            allowRedirects: true
        };
        const uri = `https://github.com/replicatedhq/kots/releases/download/${version}/kots_linux_amd64.tar.gz`;
        const { fd , path: downloadPath , cleanup  } = await (0, _tmpPromise.file)({
            postfix: '.tar.gz'
        });
        _core.debug(`Downloading kots binary to temp file at ${downloadPath}`);
        const f = _fs.createWriteStream(downloadPath);
        const res = await http.get(uri);
        const kotsPath = new Promise(async (resolve, reject)=>{
            _core.info('Downloaded kots binary');
            res.message.pipe(f).on('close', async ()=>{
                let tarOutput, tarError = '';
                const tarOptions = {};
                tarOptions.listeners = {
                    stdout: (data)=>{
                        tarOutput += data.toString();
                    },
                    stderr: (data)=>{
                        tarError += data.toString();
                    }
                };
                tarOptions.cwd = _path.dirname(downloadPath);
                await _exec.exec('tar', [
                    'xzf',
                    downloadPath
                ], tarOptions);
                _core.info('Extracted kots archive');
                const kotsPath = _path.resolve(_path.join(_path.dirname(downloadPath), 'kots'));
                _core.setOutput('kots-path', kotsPath);
                resolve(kotsPath);
            });
        });
        return await kotsPath;
    } catch (error) {
        _core.setFailed(error.message);
        throw error;
    }
}
async function getLatestKotsVersion() {
    try {
        const http = new _httpClient.HttpClient();
        const res = await http.get(`https://kots.io/install?version`);
        if (res.message.statusCode != 200) {
            throw new Error(`Failed to get latest kots version: Server responded with ${res.message.statusCode}`);
        }
        const body = await res.readBody();
        return body;
    } catch (err) {
        _core.setFailed(err.message);
        throw err;
    }
}
async function installApp(kotsPath, licenseFilePath, configFilePath) {
    try {
        const kubeconfig = _core.getInput('kubeconfig');
        const slug = _core.getInput('slug');
        const sequence = _core.getInput('sequence');
        const namespace = _core.getInput('namespace');
        // write the kubeconfig to a temp file
        const { fd , path: kubeconfigPath , cleanup  } = await (0, _tmpPromise.file)({
            postfix: '.yaml'
        });
        _fs.writeFileSync(kubeconfigPath, kubeconfig);
        const installOptions = {};
        installOptions.listeners = {
            stdout: (data)=>{
                _core.info(data.toString());
            }
        };
        const password = _randomstring.generate(12);
        const params = [
            '--kubeconfig',
            kubeconfigPath,
            'install',
            `${slug}/sequence/${sequence}`,
            "--namespace",
            namespace,
            "--shared-password",
            password,
            "--no-port-forward",
            "--license-file",
            licenseFilePath
        ];
        if (configFilePath !== '') {
            params.push("--config-values", configFilePath);
        }
        if (_core.getInput('skip-preflights') === 'true') {
            params.push("--skip-preflights");
        }
        await _exec.exec(kotsPath, params, installOptions);
        _core.setOutput('password', password);
        cleanup();
    } catch (error) {
        _core.setFailed(error.message);
    }
}
