/**
 * Created by Sergiu Ghenciu on 13/02/2018
 */

'use strict';

angular
  .module('services.filters-settings-service', ['services.api-service'])
  .factory('filtersSettingsService', [
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
          data: res.data || [],
        };
      };

      const getAll = (filterId, params) =>
        api
          .get(
            '/configuration-srv/v2/filters/' + filterId + '/settings',
            mapParams(params)
          )
          .then(responseMiddleware);

      const create = (filterId, doc) =>
        api.post(
          '/configuration-srv/v2/filters/' + filterId + '/settings',
          doc
        );

      return {
        getAll,
        create,
      };
    },
  ]);
