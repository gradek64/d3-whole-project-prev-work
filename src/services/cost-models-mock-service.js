/**
 * Created by Sergiu Ghenciu on 27/12/2017
 */

'use strict';

angular
  .module('services.cost-models-mock-service', ['utils.misc'])
  .factory('costModelsMockService', [
    'misc',
    '$q',
    function(_, $q) {
      const items = [
        {
          id: 1,
          name: 'Default Configuration Model',
          configurationNumber: 1,
          type: 'SYSTEM',
          version: 1,
          createdBy: 'joy@amalytics.co',
          creationDate: '2018-06-22T14:41:48.48166Z',
          uuid: '5bc86a0a-978c-4364-88dd-58832569113f',
        },
        {
          id: 20000,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21529678719',
          configurationNumber: 20000,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T14:45:20.347Z',
        },
        {
          id: 20001,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21529679562',
          configurationNumber: 20001,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T14:59:23.178Z',
        },
        {
          id: 20002,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21529680238',
          configurationNumber: 20002,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T15:10:39.542Z',
        },
        {
          id: 20003,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21529681069',
          configurationNumber: 20003,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T15:24:30.226Z',
        },
        {
          id: 20004,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21529681296',
          configurationNumber: 20004,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T15:28:17.668Z',
        },
        {
          id: 20005,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21529683660',
          configurationNumber: 20005,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T16:07:41.239Z',
        },
        {
          id: 20006,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11529925064',
          configurationNumber: 20006,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-25T11:11:05.415Z',
        },
        {
          id: 20007,
          parentConfigurationId: 1,
          name: 'Training 101',
          configurationNumber: 20007,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-25T13:23:55.622Z',
        },
        {
          id: 20008,
          parentConfigurationId: 20006,
          name: 'Rohinas Test',
          configurationNumber: 20008,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-25T13:52:46.328Z',
        },
        {
          id: 20009,
          parentConfigurationId: 1,
          name: 'TestFilterConfiguration21530193765',
          configurationNumber: 20009,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-28T13:49:26.738Z',
        },
        {
          id: 20010,
          parentConfigurationId: 1,
          name: 'TestFilterConfiguration21530196302',
          configurationNumber: 20010,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-28T14:31:43.786Z',
        },
        {
          id: 20011,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11530196992',
          configurationNumber: 20011,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-28T14:43:13.773Z',
        },
        {
          id: 20012,
          parentConfigurationId: 1,
          name: 'TestImplementationScriptFullSet1531908664',
          configurationNumber: 20012,
          type: 'USER',
          version: 1,
          createdBy: 'adam@amalytics.co',
          creationDate: '2018-07-18T10:11:04.861Z',
        },
        {
          id: 20013,
          parentConfigurationId: 1,
          name: 'TestImplementationScriptFullSet1531908733',
          configurationNumber: 20013,
          type: 'USER',
          version: 1,
          createdBy: 'adam@amalytics.co',
          creationDate: '2018-07-18T10:12:13.738Z',
        },
        {
          id: 20014,
          parentConfigurationId: 1,
          name: 'TestFilterConfiguration21531925724',
          configurationNumber: 20014,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T14:55:25.023Z',
        },
        {
          id: 20015,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531925791',
          configurationNumber: 20015,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T14:56:31.325Z',
        },
        {
          id: 20016,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531925971',
          configurationNumber: 20016,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T14:59:31.752Z',
        },
        {
          id: 20017,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531926071',
          configurationNumber: 20017,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:01:11.476Z',
        },
        {
          id: 20018,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531926167',
          configurationNumber: 20018,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:02:47.376Z',
        },
        {
          id: 20019,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531926345',
          configurationNumber: 20019,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:05:45.153Z',
        },
        {
          id: 20020,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531926522',
          configurationNumber: 20020,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:08:42.522Z',
        },
        {
          id: 20021,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21531926610',
          configurationNumber: 20021,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:10:10.666Z',
        },
        {
          id: 20022,
          parentConfigurationId: 1,
          name: 'OrganisationCapabilities1531926692',
          configurationNumber: 20022,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:11:32.773Z',
        },
        {
          id: 20023,
          parentConfigurationId: 1,
          name: 'Sub Cost Pot Filter Configuration1531926870',
          configurationNumber: 20023,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:14:30.878Z',
        },
        {
          id: 20024,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531926969',
          configurationNumber: 20024,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:16:09.673Z',
        },
        {
          id: 20025,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11531927064',
          configurationNumber: 20025,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:17:44.996Z',
        },
        {
          id: 20026,
          parentConfigurationId: 1,
          name: 'TestFilterConfiguration21532004787',
          configurationNumber: 20026,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T12:53:08.201Z',
        },
        {
          id: 20027,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532004797',
          configurationNumber: 20027,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T12:53:17.434Z',
        },
        {
          id: 20028,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532004980',
          configurationNumber: 20028,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T12:56:20.629Z',
        },
        {
          id: 20029,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532005080',
          configurationNumber: 20029,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T12:58:00.675Z',
        },
        {
          id: 20030,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532005176',
          configurationNumber: 20030,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T12:59:36.619Z',
        },
        {
          id: 20031,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532005354',
          configurationNumber: 20031,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:02:34.963Z',
        },
        {
          id: 20032,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532005532',
          configurationNumber: 20032,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:05:32.567Z',
        },
        {
          id: 20033,
          parentConfigurationId: 1,
          name: 'NormalPathScenario21532005620',
          configurationNumber: 20033,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:07:01.183Z',
        },
        {
          id: 20034,
          parentConfigurationId: 1,
          name: 'OrganisationCapabilities1532005703',
          configurationNumber: 20034,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:08:23.42Z',
        },
        {
          id: 20035,
          parentConfigurationId: 1,
          name: 'Sub Cost Pot Filter Configuration1532005882',
          configurationNumber: 20035,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:11:22.226Z',
        },
        {
          id: 20036,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532005981',
          configurationNumber: 20036,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:13:01.523Z',
        },
        {
          id: 20037,
          parentConfigurationId: 1,
          name: 'NormalPathScenario11532006076',
          configurationNumber: 20037,
          type: 'USER',
          version: 1,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-19T13:14:37.105Z',
        },
      ];

      const sort = (items, params) => {
        if (_.def(params.predicate)) {
          items.sort(_.compareFactory(params.predicate, params.reverse));
        }
      };

      const getOne = (configId, costpotId, params) =>
        getAll(configId, params).then((res) => {
          return res.data.find((e) => e.id === parseInt(configId));
        });

      const prop = (prop, obj) => obj && obj[prop];

      const sortParams = (params) => prop('sort', params) || {};

      const pagParams = (params) =>
        prop('pagination', params) || {start: 0, number: 200};

      const prepare = (items, params) => {
        const res = _.copy(items);
        sort(res, sortParams(params));

        const pag = pagParams(params);
        return res.slice(pag.start, pag.start + pag.number);
      };

      const getAll = (params) =>
        $q((resolve) => {
          setTimeout(() => {
            resolve({
              data: prepare(items, params),
              totalItemCount: _.length(items),
            });
          }, 0);
        });

      return {
        getAll,
        getOne,
      };
    },
  ]);
