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
    login: ()=>login,
    installChart: ()=>installChart
});
const _core = /*#__PURE__*/ _interopRequireWildcard(require("@actions/core"));
const _exec = /*#__PURE__*/ _interopRequireWildcard(require("@actions/exec"));
const _fs = /*#__PURE__*/ _interopRequireWildcard(require("fs"));
const _url = /*#__PURE__*/ _interopRequireWildcard(require("url"));
const _tmpPromise = require("tmp-promise");
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
async function login(helmPath, username, password) {
    try {
        if (!username || !password) {
            _core.info('No username or password provided, skipping login');
            return;
        }
        const parsed = _url.parse(_core.getInput('chart'));
        const loginOptions = {};
        loginOptions.listeners = {
            stdout: (data)=>{
                _core.info(data.toString());
            },
            stderr: (data)=>{
                _core.info(data.toString());
            }
        };
        const params = [
            'registry',
            'login',
            parsed.hostname,
            '--username',
            username,
            '--password',
            password
        ];
        await _exec.exec(helmPath, params, loginOptions);
    } catch (error) {
        _core.setFailed(error.message);
    }
}
async function installChart(helmPath, valuesPath) {
    try {
        const kubeconfig = _core.getInput('kubeconfig');
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
            },
            stderr: (data)=>{
                _core.info(data.toString());
            }
        };
        const params = [
            'install',
            `${_core.getInput('name')}`,
            '--kubeconfig',
            kubeconfigPath,
            '--namespace',
            _core.getInput('namespace'),
            '--create-namespace',
            `${_core.getInput('chart')}`,
            `--version`,
            `${_core.getInput('version')}`
        ];
        if (valuesPath !== '') {
            params.push('--values', valuesPath);
        }
        await _exec.exec(helmPath, params, installOptions);
        cleanup();
    } catch (error) {
        _core.setFailed(error.message);
    }
}
