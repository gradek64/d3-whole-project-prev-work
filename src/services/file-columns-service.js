/**
 * Created by Sergiu Ghenciu on 22/01/2018
 */

'use strict';

angular
  .module('services.file-columns-service', ['services.api-service'])
  .factory('fileColumnsService', [
    'apiService',
    (api) => {
      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const getAll = (id, params) =>
        api
          .get('/configuration-srv/v2/files/' + id + '/column', params)
          .then(responseMiddleware);

      const update = (id, params) =>
        api
          .patch('/configuration-srv/v2/files/' + id + '/column', params)
          .then(responseMiddleware);

      return {
        getAll,
        update,
      };
    },
  ]);
