/**
 * Created by Sergiu Ghenciu on 27/12/2017
 */

'use strict';

/*
    configurationId
:
20037
createdBy
:
"rc1@amalytics.co"
createdDate
:
"2018-07-19T13:14:37.124Z"
id
:
524
levelId
:
304
name
:
"General Ledger"
parentId
:
null
resourceTypeId
:
495
type
:
"USER"

*/

angular
  .module('services.cost-pots-mock-service', ['utils.misc'])
  .factory('costPotsMockService', [
    'misc',
    '$q',
    function(_, $q) {
      const items = [
        {
          id: 36,
          name: 'General Ledger',
          levelId: 16,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.195Z',
        },
        {
          id: 37,
          name: 'Contracts',
          levelId: 17,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.196Z',
        },
        {
          id: 38,
          name: 'Labour',
          levelId: 17,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.196Z',
        },
        {
          id: 39,
          name: 'Other',
          levelId: 17,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.196Z',
        },
        {
          id: 40,
          name: 'IT Functional Breakdown',
          levelId: 18,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.197Z',
        },
        {
          id: 41,
          name: 'Data Centre',
          levelId: 19,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.197Z',
        },
        {
          id: 42,
          name: 'Storage',
          levelId: 20,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.198Z',
        },
        {
          id: 43,
          name: 'Physical Server',
          levelId: 20,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.198Z',
        },
        {
          id: 44,
          name: 'IT Services',
          levelId: 22,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.198Z',
        },
        {
          id: 45,
          name: 'Organisation Capabilities',
          levelId: 23,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.199Z',
        },
        {
          id: 46,
          name: 'Generic',
          levelId: 21,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.199Z',
        },
        {
          id: 47,
          name: 'Virtual Server',
          levelId: 21,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.199Z',
        },
        {
          id: 48,
          name: 'Network',
          levelId: 20,
          configurationId: 20001,
          parentId: null,
          type: 'USER',
          resourceTypeId: 20,
          createdBy: 'rc1@amalytics.co',
          createdDate: '2018-06-22T14:59:23.199Z',
        },
      ];

      /* const sort = (items, params) => {
        if (_.def(params.predicate)) {
          items.sort(_.compareFactory(params.predicate, params.reverse));
        }
      };*/

      // const prop = (prop, obj) => obj && obj[prop];

      // const sortParams = (params) => prop('sort', params) || {};

      // const pagParams = (params) =>
      // prop('pagination', params) || {start: 0, number: 200};

      const updateConfigId = (data, configId, costpotId) => {
        data.forEach((e) => {
          if (costpotId) {
            e.id = Number(costpotId);
          }
          e.configurationId = Number(configId);
        });
        return data;
      };

      const prepare = (items, configId, costpotId) => {
        const res = _.copy(items);
        // sort(res, sortParams(params));
        const restUpdated = updateConfigId(res, configId, costpotId);
        // const pag = pagParams(params);
        // return res.slice(pag.start, pag.start + pag.number);

        console.log('costPots service....', restUpdated);
        return restUpdated;
      };

      const getOne = (configId, costpotId) =>
        getAll(configId, costpotId).then((res) =>
          res.data.find((item) => item.id === Number(costpotId))
        );

      const getAll = (configId, costpotId) =>
        $q((resolve) => {
          setTimeout(() => {
            console.log('gkkgi');
            resolve({
              data: prepare(items, configId, costpotId),
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
