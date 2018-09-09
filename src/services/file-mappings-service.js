/**
 * Created by Sergiu Ghenciu on 22/01/2018
 */

'use strict';

angular
  .module('services.file-mappings-service', [
    'services.api-service',
    'utils.misc',
  ])
  .factory('fileMappingsService', [
    'apiService',
    'misc',
    '$q',
    function(api, _, $q) {
      const concat = (res) => {
        return {data: _.flatten(_.pluck('data', res))};
      };

      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const getCommon = (params) =>
        api
          .get('/configuration-srv/v2/references', params)
          .then(responseMiddleware);

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
