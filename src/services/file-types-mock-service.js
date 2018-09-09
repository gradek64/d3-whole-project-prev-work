/**
 * Created by Sergiu Ghenciu on 16/01/2018
 */

'use strict';

angular
  .module('services.file-types-mock-service', ['utils.misc'])
  .factory('fileTypesMockService', [
    'misc',
    '$q',
    (_, $q) => {
      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const ServiceTypesMap = {
        '27': 'General Ledger',
        '36': 'Services',
        '42': 'Storage',
        '37': 'Organisation Capabilities',
        '38': 'IT Functional Breakdown',
        '39': 'Generic',
        '31': 'Data Centre',
      };

      const items = [
        {
          id: 42,
          resourceTypeId: 20,
          code: 'SERVICES',
          name: 'Services Mock1',
          description: 'Contains a list of services',
          type: 'SYSTEM',
          multipleActive: false,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T14:59:23.191Z',
          tenantId: '1',
        },
        {
          id: 43,
          resourceTypeId: 20,
          code: 'RATIO',
          name: 'Ratio Mock2',
          description: 'Contains a list of services',
          type: 'SYSTEM',
          multipleActive: false,
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T14:59:23.191Z',
          tenantId: '1',
        },
      ];

      const prepare = (items, resourceId) => {
        return items.map((e) => {
          // e.resourceTypeId = resourceId;
          // e.name = ServiceTypesMap[resourceId.toString()];
          // e.code = ServiceTypesMap[resourceId.toString()].toUpperCase();

          return e;
        });
      };

      const getAll = (resourceId) => {
        return $q((resolve) => {
          console.log('resourceId', resourceId);
          const set = prepare(items, resourceId);
          console.log('set', set);
          setTimeout(() => {
            resolve({
              data: prepare(items, resourceId),
              totalItemCount: _.length(items),
            });
          }, 0);
        }).then(responseMiddleware);
      };

      return {
        getAll,
      };
    },
  ]);
