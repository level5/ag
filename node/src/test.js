// (C) Copyright 2017 Hewlett Packard Enterprise Development LP

const co = require('co');
var atlasClient = require('../client/atlasClient');
var utils = require('../common/utils');
var log = require('../common/log');
var fs = require('fs');
const settingConf = '/ci/data/ovgd-setting/ovgdSetting.json';
var ovgdSetting;

if (!utils.isDevEnv() && fs.existsSync(settingConf)) {
  log.info('Find OVGD setting file: ' + settingConf);
  ovgdSetting = require(settingConf);
}

/**
 * This script is allowed to custom something for OVGD.
 * Here you can modify Atlas or else setting.
 * It will be called when node server is start.
 */

exports.customOVGDSetting = customOVGDSetting;

/**
 * Here you can do something to custom you need.
 * this method if reject err that lead to OVGD node server can not start.
 */
function customOVGDSetting() {
  return new Promise(function(resolve, reject) {
    co(function * () {
      let data;
      if (!utils.isDevEnv() && ovgdSetting) {
        let preBundleCertSetting = ovgdSetting.preBundleCertSetting;
        /**
         * So far the 'deleteRequired' field is always false that means to close this feature.
         * Because OVGD can't cover the scenario that user manually import pre-bundled certificates if we delete them at Atlas every boot.
         * But if just delete them at first boot, the pre-bundled certificates will be back once Atlas restart.
         * Waiting for Atlas address this issue.
         */
        if (preBundleCertSetting && preBundleCertSetting.deleteRequired) {
          atlasClient.deletePrebundledCerts(preBundleCertSetting.unusedPreBundleCerts);
          ovgdSetting.preBundleCertSetting.deleteRequired = false;
          data = ovgdSetting;
        }
        if (data) {
          yield updateSettingFile(data);
        }
      }
      resolve();
    }).catch(err => {
      log.error({err}, 'Failed to custom OVGD setting');
      reject(err);
    });
  });
};

function testReturnCo() {
  return co(function * () {
    let i = yield　Promise.resolve(1);
    return i;
  });
}

let check = function (a, b, c) {
  return co(function * () {
    let i = yield　Promise.resolve(1 + a + b + c);
    return i;
  });
}
// 
// let update = (a, b, c) => {
//   return co(function * () {
//     let i = yield　Promise.resolve(1 + a + b + c + arguments.length);
//     return i;
//   });
// }

let ye = function() {
  return co(function * () {
    return 11
  }).catch(err => console.log(err))
}

/*
 * Update OVGD setting file.
 */
function updateSettingFile(data) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(settingConf, JSON.stringify(data, null, 2), function(err) {
      if (err) {
        log.error({err}, 'Failed to update setting file: ' + settingConf);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
