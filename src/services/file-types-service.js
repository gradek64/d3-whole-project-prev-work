/**
 * Created by Sergiu Ghenciu on 16/01/2018
 */

'use strict';

angular
  .module('services.file-types-service', ['services.api-service'])
  .factory('fileTypesService', [
    'apiService',
    (api) => {
      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const getAll = (resourceId, params) =>
        api
          .get(
            '/configuration-srv/v2/resourcetypes/' + resourceId + '/filetypes',
            params
          )
          .then(responseMiddleware);

      return {
        getAll,
      };
    },
  ]);
