/**
 * Created by Greg Gil
 */

'use strict';

angular
  .module('services.outputs-types-service', ['services.api-service'])
  .factory('outputsTypesService', [
    'apiService',
    (api) => {
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
          data: res.data || [],
        };
      };

      const getStages = () =>
        api
          .get(
            // /v2/configurations/2/outputs
            '/configuration-srv/v2/stages',
            mapParams()
          )
          .then(responseMiddleware);

      const getAll = () =>
        api
          .get('/configuration-srv/v2/outputs/types', mapParams())
          .then(responseMiddleware);

      return {
        getAll,
        getStages,
      };
    },
  ]);
