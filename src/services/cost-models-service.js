/**
 * Created by Sergiu Ghenciu on 27/12/2017
 */

'use strict';

angular
  .module('services.cost-models-service', ['services.api-service'])
  .factory('costModelsService', [
    'apiService',
    (api) => {
      /* the `input` is the `tableState` of smart-table module */
      const mapParams = ({
        pagination = {start: 0, number: 200},
        sort = {},
        search,
      } = {}) => {
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
          data: res.data.configurationResponseList,
          totalItemCount: res.data.total,
        };
      };

      const getAll = (params) =>
        api
          .get('/configuration-srv/v2/configurations', mapParams(params))
          .then(responseMiddleware);

      const getOne = (id, params) =>
        getAll(params).then((res) => {
          return res.data.find((e) => e.id === parseInt(id));
        });

      const create = (doc) => {
        return api
          .post('/configuration-srv/v2/configurations', doc)
          .then((res) => {
            return res;
          });
      };

      const update = (id, doc) => {
        return api.patch('/configuration-srv/v2/configurations/' + id, doc);
      };

      const del = (id) => {
        return api.delete('/configuration-srv/v2/configurations/' + id, {
          transformResponse: (data, headers, status) => {
            if (status === 200) {
              return data;
            } else if (status === -1) {
              const err = {status: -1, xhrStatus: 'abort', data: null};
              throw err;
            } else {
              throw data;
            }
          },
        });
      };

      return {
        getAll,
        getOne,
        create,
        delete: del,
        update,
      };
    },
  ]);
