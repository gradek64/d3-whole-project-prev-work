/**
 * Created by Sergiu Ghenciu on 03/04/2018
 */

'use strict';
angular
  .module('services.users-service', ['services.api-service'])
  .factory('usersService', [
    'apiService',
    function(api) {
      /* the `input` is the `tableState` of smart-table module */
      const mapParams = ({pagination = {}, sort = {}, search} = {}) => {
        if (pagination.start === undefined) {
          pagination.start = 0;
        }
        if (pagination.number === undefined) {
          pagination.number = 200;
        }
        const config = {};
        config.headers = {};
        config.headers['x-amalytics-range'] =
          pagination.start + '-' + (pagination.start + pagination.number);
        // config.headers['x-amalytics-range'] = '0-6';
        if (sort.predicate) {
          config.headers['x-amalytics-sort'] = sort.predicate;
          config.headers['x-amalytics-sort-direction'] = sort.reverse
            ? 'DESC'
            : 'ASC';
        }

        return config;
      };

      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
          totalItemCount: 200,
        };
      };

      const del = (userId) => api.delete('/auth/v2/users/' + userId);

      const getAll = (params) =>
        api.get('/auth/v2/users', mapParams(params)).then(responseMiddleware);

      return {
        getAll,
        delete: del,
      };
    },
  ]);
