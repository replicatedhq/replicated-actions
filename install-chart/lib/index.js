"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = /*#__PURE__*/ _interopRequireWildcard(require("@actions/core"));
const _helm = require("./helm");
const _tmpPromise = require("tmp-promise");
const _fs = /*#__PURE__*/ _interopRequireWildcard(require("fs"));
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
async function run() {
    // Write the values
    let valuesFilePath = '';
    if (_core.getInput('values')) {
        const { fd , path: valuesPath , cleanup: cleanupValues  } = await (0, _tmpPromise.file)({
            postfix: '.yaml'
        });
        _fs.writeFileSync(valuesPath, _core.getInput('values'));
        valuesFilePath = valuesPath;
    }
    await (0, _helm.login)(_core.getInput('helm-path'), _core.getInput('registry-username'), _core.getInput('registry-password'));
    await (0, _helm.installChart)(_core.getInput('helm-path'), valuesFilePath);
// cleanupLicense();
}
run();
