/**
 * Created by Sergiu Ghenciu on 05/01/2018
 */

'use strict';

angular
  .module('services.resource-type-mock-service', ['services.api-service'])
  .factory('resourceTypeMockService', [
    'apiService',
    '$q',
    (api, $q) => {
      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const items = [
        {label: 'SOURCE', value: {type: 'SOURCE', id: 495}},
        {label: 'CONTRACT', value: {type: 'CONTRACT', id: 496}},
        {label: 'LABOUR', value: {type: 'LABOUR', id: 497}},
        {label: 'RECOVERY', value: {type: 'RECOVERY', id: 498}},
        {label: 'DATA_CENTRE', value: {type: 'DATA_CENTRE', id: 499}},
        {
          label: 'PHYSICAL_SERVER',
          value: {type: 'PHYSICAL_SERVER', id: 500},
        },
        {label: 'VIRTUAL_SERVER', value: {type: 'VIRTUAL_SERVER', id: 501}},
        {label: 'STORAGE', value: {type: 'STORAGE', id: 502}},
        {label: 'NETWORK', value: {type: 'NETWORK', id: 503}},
        {label: 'SERVICE', value: {type: 'SERVICE', id: 504}},
        {label: 'TARGET', value: {type: 'TARGET', id: 505}},
        {label: 'ITFB', value: {type: 'ITFB', id: 506}},
        {label: 'GENERIC', value: {type: 'GENERIC', id: 507}},
      ];

      const getAll = (id, params) => {
        return $q((resolve) => {
          resolve({data: items});
        }).then(responseMiddleware);
      };

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
