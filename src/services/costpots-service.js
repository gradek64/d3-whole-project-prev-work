/**
 * Created by Sergiu Ghenciu on 02/01/2018
 */

'use strict';

angular
  .module('services.costpots-service', ['services.api-service'])
  .factory('costpotsService', [
    'apiService',
    (api) => {
      /* the `input` is the `tableState` of smart-table module */
      const mapParams = (
        {pagination, sort, search} = {
          pagination: {start: 0, number: 10000},
          sort: {},
        }
      ) => {
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
        console.log('scope.allCostpots', res);

        return {
          data: res.data.costPotList || [],
          totalItemCount: res.data.total || 0,
        };
      };

      const getAll = (id, params) =>
        api
          .get(
            '/configuration-srv/v2/configurations/' + id + '/costpots',
            mapParams(params)
          )
          .then(responseMiddleware);

      const getOne = (confId, costpotId, params) =>
        getAll(confId, params).then((res) => {
          return res.data.find((e) => e.id === parseInt(costpotId));
        });

      const create = (id, doc) => {
        return api.post(
          '/configuration-srv/v2/configurations/' + id + '/costpots',
          doc
        );
      };

      const del = (confId, costpotId) => {
        return api.delete(
          '/configuration-srv/v2/configurations/' +
            confId +
            '/costpots/' +
            costpotId
        );
      };

      return {
        getAll,
        getOne,
        create,
        delete: del,
      };
    },
  ]);
