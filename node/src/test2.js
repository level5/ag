// (C) Copyright 2015-2018 Hewlett Packard Enterprise Development LP
'use strict';

var chai = require('chai');
chai.should();
const assert = chai.assert;

const ms = require('ms');
const rewire = require('rewire');
const sinon = require('sinon');
const _ = require('lodash');

const basic = require('../../applianceManager/applianceBasic');
const CONST = require('../../common/const');
const ERRORS = require('../../common/error');
const log = require('../../common/log');

const MAX_OV = 30;
const MAX_HC380 = 155;
const MAX_SIMPLIVITY = 25;

const simplivityModule = require('../../modules/simpliVityModule');
const oneViewModule = require('../../modules/oneViewModule');
const hc380Module = require('../../modules/phoenixModule');

describe('test applianceBasic', () => {
  describe('probe appliance', () => {
    let applianceBasic;
    let oneViewClient;
    let simplivityClient;

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      oneViewClient = sinon.mock(applianceBasic.__get__('applianceClient'));
      simplivityClient = sinon.mock(applianceBasic.__get__('simpliVityClient'));
    });

    afterEach(() => {
      oneViewClient.restore();
      simplivityClient.restore();
    });

    it('probe SimpliVity', async function() {
      simplivityClient.expects('probe').once().resolves({
        REST_API_Version: '1.5',
        SVTFS_Version: '3.7.9904.284'
      });

      const m = await applianceBasic.probe({log}, {applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});

      simplivityClient.verify();
      assert.isTrue(m === simplivityModule);
    });

    it('probe OneView', async function() {
      simplivityClient.expects('probe').once().resolves(undefined);
      oneViewClient.expects('probe').once().resolves({
        modelNumber: CONST.ApplianceModels.SYNERGY
      });

      const m = await applianceBasic.probe({log}, {applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});

      simplivityClient.verify();
      oneViewClient.verify();
      assert.isTrue(m === oneViewModule);
    });

    it('probe HC380', async function() {
      simplivityClient.expects('probe').once().resolves(undefined);
      oneViewClient.expects('probe').once().resolves({
        modelNumber: CONST.ApplianceModels.HC380
      });

      const m = await applianceBasic.probe({log}, {applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});

      simplivityClient.verify();
      oneViewClient.verify();
      assert.isTrue(m === hc380Module);
    });

    it('probe HC380 1.00.01', async function() {
      simplivityClient.expects('probe').once().resolves(undefined);
      oneViewClient.expects('probe').once().resolves({
        modelNumber: CONST.ApplianceModels.ONEVIEW
      });
      oneViewClient.expects('registerApplianceToCache').once().resolves();
      oneViewClient.expects('performGetForAppliance').once().callsArgWith(3, undefined, {systemUri: '/system'});

      const m = await applianceBasic.probe({log}, {applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});

      simplivityClient.verify();
      oneViewClient.verify();
      assert.isTrue(m === hc380Module);
    });

    it('probe OneView with modelNumber: ' + CONST.ApplianceModels.ONEVIEW, async function() {
      simplivityClient.expects('probe').once().resolves(undefined);
      oneViewClient.expects('probe').once().resolves({
        modelNumber: CONST.ApplianceModels.ONEVIEW
      });
      oneViewClient.expects('registerApplianceToCache').once().resolves();
      oneViewClient.expects('performGetForAppliance').once().callsArgWith(3, {statusCode: 404}, undefined);

      const m = await applianceBasic.probe({log}, {applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});

      simplivityClient.verify();
      oneViewClient.verify();
      assert.isTrue(m === oneViewModule);
    });

    it('probe unsupport appliance', async function() {
      simplivityClient.expects('probe').once().resolves(undefined);
      oneViewClient.expects('probe').once().resolves({});

      try {
        await applianceBasic.probe({log}, {applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});
        assert.fail('should throws error');
      } catch (e) {
        simplivityClient.verify();
        oneViewClient.verify();
        assert.isTrue(e === ERRORS.INVALID_APPLIANCE_ADDRESS);
      }
    });
  });

  describe('getBestModule', () => {
    _.zip([CONST.MODULES.SIMPLIVITY, CONST.MODULES.ONEVIEW, CONST.MODULES.PHOENIX], [simplivityModule, oneViewModule, hc380Module]).forEach(([name, module]) => {
      it(`get ${name} module`, async function() {
        const m = await basic.getBestModule({moduleName: name});
        assert.isTrue(module === m);
      });
    });

    it('call with wrong moduleName', async function() {
      try {
        await basic.getBestModule({moduleName: 'wrong'});
        assert.fail('should throws error');
      } catch (e) {
        assert.isTrue(ERRORS.UNSUPPORTED_APPLIANCE === e);
      }
    });

    it('probe if called with without moduleName', async function() {
      const applianceBasic = rewire('../../applianceManager/applianceBasic');
      const mock = sinon.mock(applianceBasic);
      mock.expects('probe').once().resolves(oneViewModule);

      const m = await applianceBasic.getBestModule({applianceLocation: '1.1.1.1', username: 'u', password: 'p', loginDomain: 'Local'});

      mock.verify();
      assert.isTrue(m === oneViewModule);
    });
  });

  describe('test checkDuplicationP function', () => {
    let applianceBasic;
    let dbClient;

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      dbClient = sinon.mock(applianceBasic.__get__('dbClient'));
    });

    afterEach(() => {
      dbClient.restore();
    });

    it('test checkDuplicationP with empty list', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, []);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '1.2.3.4', serialNumber: '1111'}).then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkDuplicationP with no error', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        applianceLocation: '2.2.3.4',
        serialNumber: '2222'
      }, {
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        applianceLocation: '3.2.3.4',
        serialNumber: '3333'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '1.2.3.4', serialNumber: '1111', id: 'newid'}).then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkDuplicationP with no error, ignore self', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: 'appliance-id-1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        applianceLocation: '2.2.3.4',
        serialNumber: '2222'
      }, {
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: 'appliance-id-2',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        applianceLocation: '3.2.3.4',
        serialNumber: '3333'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '2.2.3.4', serialNumber: '2222', id: 'appliance-id-1'}).then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkDuplicationP with same location', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        applianceLocation: '1.2.3.4'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '1.2.3.4', serialNumber: '1111', id: 'newid'}).then(() => {
        done('This test case should report error.');
      }, error => {
        log.error(error);
        error.error_code.should.eql('ADD_APPLIANCE_DUPLICATED');
        done();
      });
    });

    it('test checkDuplicationP with same host', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        hostname: '1.2.3.4'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '1.2.3.4', serialNumber: '1111', id: 'newid'}).then(() => {
        done('This test case should report error.');
      }, error => {
        log.error(error);
        error.error_code.should.eql('ADD_APPLIANCE_DUPLICATED');
        done();
      });
    });

    it('test checkDuplicationP with same original uuid', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        serialNumber: '1111',
        originalUuid: '1111'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '1.2.3.4', originalUuid: '1111', id: 'newid'}).then(() => {
        done('This test case should report error.');
      }, error => {
        log.error(error);
        error.error_code.should.eql('ADD_APPLIANCE_DUPLICATED');
        done();
      });
    });

    it('test checkDuplicationP with empty serial number', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module',
        serialNumber: '1111',
        applianceLocation: '2.2.2.2',
        hostname: '2.2.2.2'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicationP(context, {applianceLocation: '1.2.3.4', serialNumber: '', id: 'newid'}).then(() => {
        done();
      }, error => {
        log.error(error);
        done('should not report error');
      });
    });
  });

  describe('test checkApplianceNameDuplicationP function', () => {
    let applianceBasic;
    let dbClient;

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      dbClient = sinon.mock(applianceBasic.__get__('dbClient'));
    });

    afterEach(() => {
      dbClient.restore();
    });

    it('test checkApplianceNameDuplicationP with empty appliance list', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, []);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicateApplianceNameP(context, 'appliance-01-id', 'appliance-01', 'appliance-01').then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkApplianceNameDuplicationP with unique appliance name', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/appliance-01-uri',
        id: 'appliance-01-id',
        applianceName: 'appliance-01'
      }, {
        uri: '/rest/global/appliances/appliance-02-uri',
        id: 'appliance-02-id',
        applianceName: 'appliance-02'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicateApplianceNameP(context, 'appliance-01-id', 'appliance-01a', 'appliance-01').then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkApplianceNameDuplicationP where the new name is the same as the current name', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/appliance-01-uri',
        id: 'appliance-01-id',
        applianceName: 'appliance-01'
      }, {
        uri: '/rest/global/appliances/appliance-02-uri',
        id: 'appliance-02-id',
        applianceName: 'appliance-02'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicateApplianceNameP(context, 'appliance-01-id', 'appliance-01', 'appliance-01').then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkApplianceNameDuplicationP with empty new appliance name', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/appliance-01-uri',
        id: 'appliance-01-id',
        applianceName: 'appliance-01'
      }, {
        uri: '/rest/global/appliances/appliance-02-uri',
        id: 'appliance-02-id',
        applianceName: 'appliance-02'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicateApplianceNameP(context, 'appliance-01-id', '', 'appliance-03').then(() => {
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test checkDuplicateApplianceNameP with duplicate appliance name', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/appliance-01-uri',
        id: 'appliance-01-id',
        applianceName: 'appliance-01'
      }]);

      let context = {log: {info: sinon.stub(), warn: sinon.stub()}};
      applianceBasic.checkDuplicateApplianceNameP(context, 'appliance-new-id', 'appliance-01', 'appliance-01a').then(() => {
        done('This test case should report error.');
      }, error => {
        log.error(error);
        error.error_code.should.eql('DUPLICATE_APPLIANCE_NAME');
        done();
      });
    });
  });

  describe('test getApplianceCountP function', () => {
    let applianceBasic;
    let dbClient;

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      dbClient = sinon.mock(applianceBasic.__get__('dbClient'));
    });

    afterEach(() => {
      dbClient.restore();
    });

    it('test getApplianceCountP with no error', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, undefined, [{category: 'appliances',
        uri: '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        id: '61cd8d28-b3e3-461a-a5aa-4e6af34139b1',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module'}, {category: 'appliances',
        uri: '/rest/global/appliances/a3affa70-515a-42d6-9fc3-c811b02e0e21',
        id: 'a3affa70-515a-42d6-9fc3-c811b02e0e21',
        name: 'HP OneView - Demo VM',
        moduleName: 'OneView Module'}, {category: 'appliances',
        uri: '/rest/global/appliances/9604484c-d4f0-4b8f-9eab-505d0f21c7c0',
        id: '9604484c-d4f0-4b8f-9eab-505d0f21c7c0',
        name: 'HPE HC380',
        moduleName: 'Phoenix Module'}]);
      let context = {log: {info: sinon.stub()}};
      applianceBasic.getApplianceCountP(context).then(results => {
        results.countOV.should.eql(2);
        results.countHC380.should.eql(1);
        results.countTotal.should.eql(3);
        done();
      }, () => {
        done('This error should not happen.');
      });
    });

    it('test getApplianceCountP with get appliances error', done => {
      let mock = dbClient.expects('getAllAppliances');
      mock.once().callsArgWithAsync(0, {error: 'Error happened.'}, []);
      let context = {log: {info: sinon.stub(), error: sinon.stub()}};
      applianceBasic.getApplianceCountP(context).then(results => {
        done('This test case should report error.');
      }, error => {
        error.error_message.should.not.be.null;
        done();
      });
    });
  });

  describe('test validateAppliancesCount function', () => {
    let applianceBasic;
    let validateAppliancesCount;
    let context = {log: {info: sinon.stub(), warn: sinon.stub()}};

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      validateAppliancesCount = applianceBasic.__get__('validateAppliancesCount');
    });
    it('test validateAppliancesCount not exceed with no error', done => {
      let applCounts = [];
      applCounts[CONST.COUNT_OV] = 1;
      applCounts[CONST.COUNT_HC380] = 1;
      applCounts[CONST.COUNT_TOTAL] = 2;

      let result = validateAppliancesCount(context, CONST.COUNT_OV, applCounts);
      result.should.eql('');
      result = validateAppliancesCount(context, CONST.COUNT_HC380, applCounts);
      result.should.eql('');
      result = validateAppliancesCount(context, CONST.COUNT_TOTAL, applCounts);
      result.should.eql('');
      done();
    });

    it('test validateAppliancesCount OV count exceed', done => {
      let applCounts = [];
      applCounts[CONST.COUNT_OV] = MAX_OV + 1;
      applCounts[CONST.COUNT_HC380] = 1;
      applCounts[CONST.COUNT_TOTAL] = MAX_OV + 2;

      validateAppliancesCount(context, CONST.COUNT_OV, applCounts).error_message.should.eql(`Exceed the maximum number ${MAX_OV} of appliances OneView.`);
      done();
    });

    it('test validateAppliancesCount HC380 count exceed', done => {
      let applCounts = [];
      applCounts[CONST.COUNT_OV] = 1;
      applCounts[CONST.COUNT_HC380] = MAX_HC380 + 1;
      applCounts[CONST.COUNT_TOTAL] = MAX_HC380 + 2;

      validateAppliancesCount(context, CONST.COUNT_HC380, applCounts).error_message.should.eql(`Exceed the maximum number ${MAX_HC380} of appliances HC380.`);
      done();
    });

    it('test validateAppliancesCount total count exceed', done => {
      let applCounts = [];
      applCounts[CONST.COUNT_OV] = MAX_OV;
      applCounts[CONST.COUNT_HC380] = MAX_HC380;
      applCounts[CONST.COUNT_TOTAL] = MAX_OV + MAX_HC380 + MAX_SIMPLIVITY + 1;

      validateAppliancesCount(context, CONST.COUNT_TOTAL, applCounts).error_message.should.eql(`Exceed the maximum number ${MAX_OV + MAX_HC380 + MAX_SIMPLIVITY} of appliances total.`);
      done();
    });

    it('lock and unlock appliance', done => {
      let id = 'testid';
      let cnt = 0;
      let total = 10;
      let promises = [];
      for (let i = 0; i < total; i++) {
        let func = async function() {
          let ctx = {log};
          await basic.lockApplianceP(ctx, id, {operation: 'edit', moduleName: 'OneView Module'});
          let ret = cnt++;
          await basic.unlockApplianceP(ctx, id);
          return ret;
        }();
        promises.push(func);
      }
      Promise.all(promises).then(values => {
        values.sort().forEach((val, index) => {
          val.should.equal(index);
        });
        cnt.should.equal(total);
        done();
      }, errors => {
        done(errors);
      });
    });

    describe('test checkExceedLimitP function', () => {
      let applianceBasic;
      let dbClient;
      let applianceCountStub;

      beforeEach(() => {
        applianceBasic = rewire('../../applianceManager/applianceBasic');
        dbClient = sinon.mock(applianceBasic.__get__('dbClient'));
        applianceCountStub = sinon.stub(applianceBasic, 'getApplianceCountP');
      });

      afterEach(() => {
        applianceCountStub.restore();
        dbClient.restore();
      });

      it('test checkExceedLimitP with no error 1', () => {
        let context = {log: {info: _.noop, debug: _.noop}};
        applianceCountStub.resolves([]);
        return applianceBasic.checkExceedLimitP(context, CONST.MODULES.ONEVIEW);
      });

      it('test checkExceedLimitP with no error 2', () => {
        let context = {log: {info: _.noop, debug: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = MAX_OV;
        applCounts[CONST.COUNT_HC380] = 24;
        applCounts[CONST.COUNT_TOTAL] = 49;
        applianceCountStub.resolves(applCounts);
        return applianceBasic.checkExceedLimitP(context, CONST.MODULES.PHOENIX);
      });

      it('test checkExceedLimitP with no error 3', () => {
        let context = {log: {info: _.noop, debug: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = 24;
        applCounts[CONST.COUNT_HC380] = 25;
        applCounts[CONST.COUNT_TOTAL] = 49;
        applianceCountStub.resolves(applCounts);
        return applianceBasic.checkExceedLimitP(context, CONST.MODULES.ONEVIEW);
      });

      it('test checkExceedLimitP with no error 4', () => {
        let context = {log: {info: _.noop, debug: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = 24;
        applCounts[CONST.COUNT_HC380] = 24;
        applCounts[CONST.COUNT_TOTAL] = 48;
        applianceCountStub.resolves(applCounts);
        return applianceBasic.checkExceedLimitP(context, CONST.MODULES.ONEVIEW);
      });

      it('test checkExceedLimitP exceeding maximum number of OneView appliances', done => {
        let context = {log: {info: _.noop, debug: _.noop, warn: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = MAX_OV + 1;
        applCounts[CONST.COUNT_HC380] = 24;
        applCounts[CONST.COUNT_TOTAL] = applCounts[CONST.COUNT_OV] + applCounts[CONST.COUNT_HC380];
        applianceCountStub.resolves(applCounts);
        applianceBasic.checkExceedLimitP(context, CONST.MODULES.ONEVIEW).then(() => {
          done('This test case should report error.');
        }, error => {
          error.error_message.should.eql(`Exceed the maximum number ${MAX_OV} of appliances OneView.`);
          done();
        });
      });

      it('test checkExceedLimitP exceeding maximum number of HC380 appliances', done => {
        let context = {log: {info: _.noop, debug: _.noop, warn: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = 24;
        applCounts[CONST.COUNT_HC380] = MAX_HC380 + 1;
        applCounts[CONST.COUNT_TOTAL] = applCounts[CONST.COUNT_OV] + applCounts[CONST.COUNT_HC380];
        applianceCountStub.resolves(applCounts);
        applianceBasic.checkExceedLimitP(context, CONST.MODULES.PHOENIX).then(() => {
          done('This test case should report error.');
        }, error => {
          error.error_message.should.eql(`Exceed the maximum number ${MAX_HC380} of appliances HC380.`);
          done();
        });
      });

      it('test checkExceedLimitP exceeding maximum number of SimpliVity appliances', done => {
        let context = {log: {info: _.noop, debug: _.noop, warn: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = 24;
        applCounts[CONST.COUNT_HC380] = 15;
        applCounts[CONST.COUNT_SIMPLIVITY] = MAX_SIMPLIVITY + 1;
        applCounts[CONST.COUNT_TOTAL] = applCounts[CONST.COUNT_OV] + applCounts[CONST.COUNT_HC380] + applCounts[CONST.COUNT_SIMPLIVITY];
        applianceCountStub.resolves(applCounts);
        applianceBasic.checkExceedLimitP(context, CONST.MODULES.SIMPLIVITY).then(() => {
          done('This test case should report error.');
        }, error => {
          error.error_message.should.eql(`Exceed the maximum number ${MAX_SIMPLIVITY} of appliances SimpliVity.`);
          done();
        });
      });

      it('test checkExceedLimitP exceeding maximum number of all appliances', () => {
        let context = {log: {info: _.noop, debug: _.noop, warn: _.noop}};
        let applCounts = [];
        applCounts[CONST.COUNT_OV] = MAX_OV;
        applCounts[CONST.COUNT_HC380] = MAX_HC380;
        applCounts[CONST.COUNT_SIMPLIVITY] = MAX_SIMPLIVITY + 1;
        applCounts[CONST.COUNT_TOTAL] = applCounts[CONST.COUNT_OV] + applCounts[CONST.COUNT_HC380] + applCounts[CONST.COUNT_SIMPLIVITY];
        applianceCountStub.resolves(applCounts);
        return applianceBasic.checkExceedLimitP(context, CONST.MODULES.SIMPLIVITY).then(() => {
          assert.fail('This test case should report error');
        }, error => {
          error.error_message.should.eql(`Exceed the maximum number ${MAX_OV + MAX_HC380 + MAX_SIMPLIVITY} of appliances total.`);
        });
      });
    });
  });

  describe('test appliancelock', () => {
    let applianceId = '5eea5c61-8711-46be-a458-7ae3802e6437';
    let TIMEOUT = '50ms';
    let PENDING_TIMEOUT = '75ms';
    let testModule = CONST.MODULES.ONEVIEW;

    describe('basic', () => {
      let applianceBasic;

      beforeEach(() => {
        applianceBasic = rewire('../../applianceManager/applianceBasic');
        applianceBasic.__set__('APPLIANCE_OPERATION_TIMEOUT', TIMEOUT);
        applianceBasic.__set__('APPLIANCE_OPERATION_PENDING_TIMEOUT', PENDING_TIMEOUT);
      });

      it('rejects lock if delete in queue', () => {
        return async function() {
          await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REMOVE, moduleName: testModule});
          try {
            await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REFRESH, moduleName: testModule});
            assert.fail('second lock should rejected');
          } catch (e) {}
        }();
      });

      it('reject refresh lock if refresh in queue', () => {
        return async function() {
          await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REFRESH, moduleName: testModule});
          try {
            await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REFRESH, moduleName: testModule});
            assert.fail('second lock should rejected');
          } catch (e) {}
        }();
      });

      it('allow delete non oneview operations if refresh in queue', () => {
        return async function() {
          await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REFRESH, moduleName: CONST.MODULES.PHOENIX});
          try {
            await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REMOVE, moduleName: CONST.MODULES.PHOENIX});
          } catch (e) {
            assert.fail('second lock should be resolved');
          }
        }();
      });

      it('reject delete oneview operations if refresh in queue', () => {
        return async function() {
          await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REFRESH, moduleName: CONST.MODULES.ONEVIEW});
          try {
            await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REMOVE, moduleName: CONST.MODULES.ONEVIEW});
            assert.fail('second lock should rejected');
          } catch (e) {}
        }();
      });
    });

    describe('timeout', () => {
      let applianceBasic;

      beforeEach(() => {
        applianceBasic = rewire('../../applianceManager/applianceBasic');
        applianceBasic.__set__('APPLIANCE_OPERATION_TIMEOUT', TIMEOUT);
        applianceBasic.__set__('APPLIANCE_OPERATION_PENDING_TIMEOUT', PENDING_TIMEOUT);
      });

      it('unlocks applianceLock after timeout', () => {
        return async function() {
          await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.ADD, moduleName: CONST.MODULES.SIMPLIVITY});
          let start = Date.now();
          await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REMOVE, moduleName: CONST.MODULES.SIMPLIVITY});
          let now = Date.now();
          let duration = now - start;
          // first lock will be unlocked after TIMEOUT ms
          duration.should.to.be.at.least(ms(TIMEOUT) - 10);
          duration.should.to.be.at.most(ms(TIMEOUT) + 10);
        }();
      });

      it('rejected if pending in queue for too much time', () => {
        return async function() {
          applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.ADD, moduleName: CONST.MODULES.PHOENIX});
          applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REFRESH, moduleName: CONST.MODULES.PHOENIX});
          let start = Date.now();
          try {
            await applianceBasic.lockApplianceP({log}, applianceId, {operation: CONST.APPLIANCE_OPERATIONS.REMOVE, moduleName: CONST.MODULES.PHOENIX});
            assert.fail('third lock should be rejected');
          } catch (e) {
            let duration = Date.now() - start;
            duration.should.to.be.at.least(ms(PENDING_TIMEOUT) - 10);
            duration.should.to.be.at.most(ms(PENDING_TIMEOUT) + 10);
          }
        }();
      });
    });
  });

  describe('delete resources by original URIs', () => {
    let applianceBasic;
    let dbClient;
    let groupService;
    let sharedResourceService;
    let category = CONST.CATEGORY.SERVER_HARDWARE;
    let storageCate = CONST.CATEGORY.STORAGE_SYSTEMS;
    let oneViewModule;
    let phoenixModule;
    let applianceUri = '/rest/global/appliances/61cd8d28-b3e3-461a-a5aa-4e6af34139b1';
    let storageOriginalUris = ['/rest/managed-sans/37333036-3831-4753-4831-31335838524E'];
    let originalUri = ['/rest/server-hardware/37333036-3831-4753-4831-31335838524E'];
    let originalUris = ['/rest/server-hardware/37333036-3831-4753-4831-31335838524E', '/rest/server-hardware/37333036-3831-4753-4831-31305838524E', '/rest/server-hardware/37333036-3831-4753-4831-30365838524E'];

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      dbClient = sinon.mock(applianceBasic.__get__('dbClient'));
      groupService = sinon.mock(applianceBasic.__get__('groupService'));
      sharedResourceService = sinon.mock(applianceBasic.__get__('sharedResourceService'));
      oneViewModule = rewire('../../modules/oneViewModule');
      phoenixModule = rewire('../../modules/phoenixModule');
    });

    afterEach(() => {
      dbClient.restore();
      groupService.restore();
      sharedResourceService.restore();
    });

    it('reject if pass empty original URIs when deleting resources by original URIs', () => {
      return async function() {
        try {
          await applianceBasic.removeResourcesByOriginUris({log}, category, undefined, applianceUri);
        } catch (err) {
          assert.isDefined(err);
          assert.isTrue(err.message.indexOf('should not have empty item') > -1);
        }

        try {
          await applianceBasic.removeResourcesByOriginUris({log}, category, undefined, undefined);
        } catch (err) {
          assert.isDefined(err);
          assert.isTrue(err.message.indexOf('should not have empty item') > -1);
        }

        try {
          await applianceBasic.removeResourcesByOriginUris({log}, category, originalUris, undefined);
        } catch (err) {
          assert.isDefined(err);
          assert.isTrue(err.message.indexOf('should not be empty') > -1);
        }
      }();
    });

    it('Throw error if get empty OVGD resource URIs when deleting resources by original URIs', () => {
      return async function() {
        try {
          let mock = dbClient.expects('query');
          mock.thrice().callsArgWithAsync(3, undefined, []);
          await applianceBasic.removeResourcesByOriginUris({log}, category, originalUris, applianceUri);
        } catch (err) {
          assert.isDefined(err);
          assert.isTrue(err.message.indexOf('Resource URI list should not have be empty') > -1);
        }
      }();
    });

    it('Throw error if get empty OVGD STORAGE resource URIs when deleting resources by original URIs', () => {
      return async function() {
        try {
          let mock = dbClient.expects('searchExactValueForNested');
          mock.thrice().callsArgWithAsync(3, undefined, []);
          await applianceBasic.removeResourcesByOriginUris({log}, storageCate, originalUris, applianceUri);
        } catch (err) {
          assert.isDefined(err);
          assert.isTrue(err.message.indexOf('Resource URI list should not have be empty') > -1);
        }
      }();
    });

    it('delete resources by original URIs happy path ', () => {
      return async function() {
        let searchMock = dbClient.expects('query');
        let listResourceMock = dbClient.expects('listCategoryResourcesOfAppliance');
        let groupMock = groupService.expects('releaseResourcesFromGroups');
        let sharedResourceMock = sharedResourceService.expects('deleteResources');
        let deleteResourceMock = dbClient.expects('deleteResourcesByUri');

        searchMock.thrice().callsArgWithAsync(3, undefined, [{uri: '/rest/global/server-hardware/affa412a-f903-49d2-89c8-8403aa406d20'}]);
        listResourceMock.once().callsArgWithAsync(3, undefined, []);
        groupMock.once().returns(new Promise((resolve, reject) => {
          resolve();
        }));
        deleteResourceMock.once().callsArgWithAsync(1, undefined, 'anything');
        sharedResourceMock.never();

        await applianceBasic.removeResourcesByOriginUris({log}, category, originalUris, applianceUri);
      }();
    });

    it('delete storage resources by original URIs happy path ', () => {
      return async function() {
        let searchMock = dbClient.expects('searchExactValueForNested');
        let resourceMock = dbClient.expects('listCategoryResourcesOfAppliance');
        let groupMock = groupService.expects('releaseResourcesFromGroups');
        let sharedResourceMock = sharedResourceService.expects('deleteResources');

        searchMock.once().callsArgWithAsync(3, undefined, [{uri: '/rest/global/managed-sans/affa412a-f903-49d2-89c8-8403aa406d20'}]);
        resourceMock.once().callsArgWithAsync(3, undefined, []);
        groupMock.once().returns(new Promise((resolve, reject) => {
          resolve();
        }));
        sharedResourceMock.once().returns(new Promise((resolve, reject) => {
          resolve();
        }));
        await applianceBasic.removeResourcesByOriginUris({log}, storageCate, storageOriginalUris, applianceUri);
      }();
    });

    it('reject if resource URIs have empty item when deleting resources by category and URIs', () => {
      return async function() {
        try {
          let resourceUris = ['/rest/server-hardware/37333036-3831-4753-4831-31335838524E', undefined, '/rest/server-hardware/37333036-3831-4753-4831-31305838524E', '/rest/server-hardware/37333036-3831-4753-4831-30365838524E'];
          await applianceBasic.removeResourcesByCatAndUris({log}, category, resourceUris, applianceUri);
        } catch (err) {
          assert.isDefined(err);
          assert.isTrue(err.message.indexOf('should not have empty item') > -1);
        }
      }();
    });

    it('delete resources by category and URIs happy path ', () => {
      return async function() {
        let searchMock = dbClient.expects('searchExactValueForNested');
        let resourceMock = dbClient.expects('listCategoryResourcesOfAppliance');
        let groupMock = groupService.expects('releaseResourcesFromGroups');
        let sharedResourceMock = sharedResourceService.expects('deleteResources');
        let deleteResourceMock = dbClient.expects('deleteResourcesByUri');

        searchMock.thrice().callsArgWithAsync(3, undefined, [{uri: '/rest/server-hardware/37333036-3831-4753-4831-30365838524E'}]);
        resourceMock.once().callsArgWithAsync(3, undefined, [{uri: '/rest/server-hardware/37333036-3831-4753-4831-30365838524E'}]);
        groupMock.once().returns(new Promise((resolve, reject) => {
          resolve();
        }));
        sharedResourceMock.never();
        deleteResourceMock.once().callsArgWithAsync(1, undefined, 'anything');

        await applianceBasic.removeResourcesByCatAndUris({log}, category, originalUri, applianceUri);
      }();
    });

    it('delete storage resources by category and URIs happy path ', () => {
      return async function() {
        let searchMock = dbClient.expects('searchExactValueForNested');
        let resourceMock = dbClient.expects('listCategoryResourcesOfAppliance');
        let groupMock = groupService.expects('releaseResourcesFromGroups');
        let sharedResourceMock = sharedResourceService.expects('deleteResources');
        let deleteResourceMock = dbClient.expects('deleteResourcesByUri');

        searchMock.once().callsArgWithAsync(3, undefined, [{uri: '/rest/global/managed-sans/affa412a-f903-49d2-89c8-8403aa406d20'}]);
        resourceMock.once().callsArgWithAsync(3, undefined, []);
        groupMock.once().returns(new Promise((resolve, reject) => {
          resolve();
        }));
        sharedResourceMock.once().returns(new Promise((resolve, reject) => {
          resolve();
        }));
        deleteResourceMock.never();
        await applianceBasic.removeResourcesByCatAndUris({log}, storageCate, storageOriginalUris, applianceUri);
      }();
    });

    it('delete OneView appliance resources happy path ', () => {
      return async function() {
        let resourceMock = dbClient.expects('listCategoryResourcesOfAppliance');
        let groupMock = groupService.expects('releaseResourcesFromGroups');
        let sharedResourceMock = sharedResourceService.expects('deleteResources');
        let deleteResourceMock = dbClient.expects('deleteResourcesByUri');

        resourceMock.exactly(12).callsArgWithAsync(3, undefined, []);
        groupMock.exactly(5).returns(new Promise((resolve, reject) => {
          resolve();
        }));
        sharedResourceMock.exactly(6).returns(new Promise((resolve, reject) => {
          resolve();
        }));
        deleteResourceMock.exactly(5).callsArgWithAsync(1, undefined, 'anything');
        let appliance = {applianceUri};
        await applianceBasic.removeApplianceResources({log}, appliance, oneViewModule.getResourceCategories());
      }();
    });

    it('delete HC 380 appliance resources happy path ', () => {
      return async function() {
        let resourceMock = dbClient.expects('listCategoryResourcesOfAppliance');
        let groupMock = groupService.expects('releaseResourcesFromGroups');
        let sharedResourceMock = sharedResourceService.expects('deleteResources');
        let deleteResourceMock = dbClient.expects('deleteResourcesByUri');

        resourceMock.exactly(2).callsArgWithAsync(3, undefined, []);
        groupMock.never();
        sharedResourceMock.never();
        deleteResourceMock.exactly(2).callsArgWithAsync(1, undefined, 'anything');
        let appliance = {applianceUri};
        await applianceBasic.removeApplianceResources({log}, appliance, phoenixModule.getResourceCategories());
      }();
    });
  });

  describe('test shouldBeAbandoned function', () => {
    let applianceBasic;
    let shouldBeAbandoned;

    beforeEach(() => {
      applianceBasic = rewire('../../applianceManager/applianceBasic');
      shouldBeAbandoned = applianceBasic.__get__('shouldBeAbandoned');
    });

    it('test shouldBeAbandoned should return no conflict if try to delete while no pending operation', () => {
      assert.isFalse(shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, []));
    });

    it('test shouldBeAbandoned should return no conflict if try to delete while refreshing without moduleName', () => {
      assert.isFalse(shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, [CONST.APPLIANCE_OPERATIONS.REFRESH]));
    });

    it('test shouldBeAbandoned should return no conflict if try to delete oneviewModule', () => {
      assert.isUndefined(shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, [], CONST.MODULES.ONEVIEW));
    });

    it('test shouldBeAbandoned should return no conflict if try to delete phoenixModule', () => {
      assert.isFalse(shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, [], CONST.MODULES.PHOENIX));
    });

    it('test shouldBeAbandoned should return no conflict if try to delete phoenixModule while refreshing', () => {
      assert.isFalse(shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, [CONST.APPLIANCE_OPERATIONS.REFRESH], CONST.MODULES.PHOENIX));
    });

    it('test shouldBeAbandoned should return conflict if try to delete while deleting', () => {
      shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, [CONST.APPLIANCE_OPERATIONS.REMOVE]).should.eql(true);
    });

    it('test shouldBeAbandoned should return conflict if try to refresh while refreshing', () => {
      shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REFRESH, [CONST.APPLIANCE_OPERATIONS.REFRESH]).should.eql(CONST.APPLIANCE_OPERATIONS.REFRESH);
    });

    it('test shouldBeAbandoned should return conflict if try to delete oneViewModule while refreshing', () => {
      shouldBeAbandoned(CONST.APPLIANCE_OPERATIONS.REMOVE, [CONST.APPLIANCE_OPERATIONS.REFRESH], CONST.MODULES.ONEVIEW).should.eql(CONST.APPLIANCE_OPERATIONS.REFRESH);
    });
  });
});
