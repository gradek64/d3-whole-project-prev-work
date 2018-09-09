/**
 * Created by Sergiu Ghenciu on 05/01/2018
 */

'use strict';

angular
  .module('services.resource-type-service', ['services.api-service'])
  .factory('resourceTypeService', [
    'apiService',
    (api) => {
      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const getAll = (id, params) =>
        api
          .get(
            '/configuration-srv/v2/configurations/' + id + '/resourcetypes',
            params
          )
          .then(responseMiddleware);

      const create = (id, doc) => {
        return api.post(
          '/configuration-srv/v2/configurations/' + id + '/resourcetypes',
          doc
        );
      };

      const del = (confId, resourceId) => {
        return api.delete(
          '/configuration-srv/v2/configurations/' +
            confId +
            '/resourcetypes/' +
            resourceId
        );
      };

      return {
        getAll,
        create,
        delete: del,
      };
    },
  ]);
