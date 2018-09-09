/**
 * Created by Sergiu Ghenciu on 22/01/2018
 */

'use strict';

angular
  .module('services.file-mappings-mock-service', [
    'services.api-service',
    'utils.misc',
  ])
  .factory('fileMappingsMockService', [
    'apiService',
    'misc',
    '$q',
    function(api, _, $q) {
      const concat = (res) => {
        return {data: _.flatten(_.pluck('data', res))};
      };

      const mappingFiles = [
        {
          name: 'ITFBLevel1',
          api: '/itfb',
          id: 'itfb1Id',
          label: 'ITFB Level 1',
          hidden: false,
        },
        {
          name: 'ITFBLevel2',
          api: '/itfb',
          id: 'itfb2Id',
          label: 'ITFB Level 2',
          hidden: false,
        },
        {
          name: 'ITFBLevel3',
          api: '/itfb',
          id: 'itfb2Id',
          label: 'ITFB Level 3',
          hidden: false,
        },
        {
          name: 'TARGET_COST_CENTRE',
          api: '/target-cost-centres',
          id: 'targetCostCentreId',
          label: 'Target Cost Centre',
          hidden: false,
        },
      ];

      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const getCommon = (params) =>
        new Promise((resolve) => {
          resolve({data: mappingFiles});
        });

      const getRelative = (fileTypeId, params) =>
        api
          .get(
            '/configuration-srv/v2/filetypes/' + fileTypeId + '/mappings',
            params
          )
          .then(responseMiddleware);

      const getAll = (fileTypeId, params, excludeCommon) => {
        if (fileTypeId === 'common') {
          return getCommon(params);
        }
        if (excludeCommon) {
          return getRelative(fileTypeId, params);
        }
        return $q
          .all([getCommon(params), getRelative(fileTypeId, params)])
          .then(concat);
      };

      return {
        getAll,
      };
    },
  ]);
