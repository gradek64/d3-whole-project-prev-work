/**
 * Created by Sergiu Ghenciu on 24/01/2018
 */

'use strict';

angular
  .module('services.filters-service', [
    'services.api-service',
    'services.filters-settings-service',
    'services.levels-service',
  ])
  .factory('filtersService', [
    'apiService',
    'filtersSettingsService',
    'levelsService',
    '$q',
    function(api, filtersSettingsService, levelsService, $q) {
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

      const getEntitlementLevel = (configId) =>
        levelsService
          .getAll(configId)
          .then((res) => res.data.find((e) => e.name === 'Entitlement'));

      const del = (configId, filterId) => {
        return api.delete(
          '/configuration-srv/v2/configurations/' +
            configId +
            '/filters/' +
            filterId
        );
      };

      const getAllOfLevel = (configId, levelId, params) =>
        api
          .get(
            '/configuration-srv/v2/configurations/' +
              configId +
              '/levels/' +
              levelId +
              '/filters',
            mapParams(params)
          )
          .then(responseMiddleware);

      const getAll = (configId, costpotId, params, isItfb) => {
        if (isItfb) {
          console.log('getAll: is Itfb');
          return getEntitlementLevel(configId).then((level) =>
            getAllOfLevel(configId, level.id, params)
          );
        }
        return api
          .get(
            '/configuration-srv/v2/configurations/' +
              configId +
              '/filters?sourceCostPotId=' +
              costpotId,
            // '/filters',
            mapParams(params)
          )
          .then(responseMiddleware);
      };

      const createSettingsFactory = (filterId) => (doc) =>
        filtersSettingsService.create(filterId, doc);

      const create = (configId, doc) =>
        api
          .post(
            '/configuration-srv/v2/configurations/' + configId + '/filters',
            doc
          )
          .then((res) =>
            $q.all(doc.settings.map(createSettingsFactory(res.data.id)))
          );

      const createWithItfbException = (configId, doc, isItfb) => {
        if (isItfb) {
          console.log('create: is Itfb');
          return getEntitlementLevel(configId).then((level) => {
            const index = doc.settings.findIndex(
              (e) => e.classification === 'SOURCE'
            );
            doc.settings[index].costPotId = null;
            doc.settings[index].levelId = level.id;
            return create(configId, doc);
          });
        }
        return create(configId, doc);
      };

      return {
        getAll,
        create: createWithItfbException,
        delete: del,
      };
    },
  ]);
