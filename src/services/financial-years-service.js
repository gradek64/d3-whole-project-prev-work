/**
 * Created by Greg Gil
 */

'use strict';

angular
  .module('services.financial-years-service', ['services.api-service'])
  .factory('financialYearsService', [
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

      const getAll = () =>
        api
          .get('/configuration-srv/v2/financial-years', mapParams())
          .then(responseMiddleware);

      return {
        getAll,
      };
    },
  ]);
