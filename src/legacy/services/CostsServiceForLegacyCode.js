/**
 * Created by Sergiu Ghenciu on 01/04/2018
 */

'use strict';

angular
  .module('legacy.services.costs-service-for-Legacy-code', ['utils.misc'])
  .factory('CostsServiceForLegacyCode', [
    'misc',
    'costsService',
    'levelsService',
    function(_, costsService, levelsService) {
      const isString = (x) => typeof x === 'string';

      const getAccessor = (groupBys) =>
        groupBys.reduce((a, e) => {
          a[e.value] = e.value;
          return a;
        }, {});

      const mapEntities = {
        'Location': 'DATA_CENTRE',
        /* Source  */
        'SourceLegalEntity': 'SOURCE_LEGAL_ENTITY',
        'CostCentre': 'SOURCE_COST_CENTRE',
        'NominalDescription': 'NOMINALS',
        'CostPoolMapping': 'COST_POOL',
        /* Entitlemenet extras*/
        'Role': 'ROLE',
        'Vendor': 'VENDOR',
        /* Functional */
        'itrs': 'ITFBLevel1',
        'subItrs': 'ITFBLevel2',
        'subSubItrs': 'ITFBLevel3',
        /* services */
        'ServiceType': 'SERVICE_TYPE',
        'ServiceGroup': 'SERVICE_GROUP',
        'ServiceName': 'SERVICE',

        /* Infructuture 1*/
        'DataCentreLocation': 'DATA_CENTRE',
        /* Infructuture 2*/
        'network': 'NETWORK',
        'physical_server': 'PHYSICAL_SERVER',
        'StorageId': 'STORAGE',
        /* Infructuture 3*/
        'generic': 'GENERIC',
        'virtual_server': 'VIRTUAL_SERVER',
        /* Services*/
        'distributedCosts.targetLegalEntity': 'TARGET_LEGAL_ENTITY',
        'distributedCosts.targetCostCentre': 'TARGET_COST_CENTRE',
      };

      const mapFilters = (items) =>
        items.reduce((a, e) => {
          const parts = e.split(',');

          if (mapEntities[parts[0].trim()]) {
            a.push({
              name: mapEntities[parts[0].trim()],
              value: parts[1].trim(),
            });
          }
          return a;
        }, []);

      const swapGroupByProperties = (groupByObj) => {
        return groupByObj.map((obj) => {
          return {value: mapEntities[obj.value]};
        });
      };

      const mapGroupBy = (items) =>
        items.map((e) => {
          return {value: e};
        });

      const levelsMap = {
        1: 'Source',
        2: 'Entitlement', // and Functional
        3: 'Infrastructure 1',
        4: 'Infrastructure 2',
        5: 'Infrastructure 3',
        6: 'Services',
        7: 'Target',
      };

      const mapLevel = (params) => {
        return levelsService
          .getAll(params.dimensionSnapshotUuid, undefined, 'model-srv')
          .then((res) =>
            res.data.find((e) => {
              // exception for Location DATA_CENTRE
              // it has to be INFRUSTRUCTURE 1
              if (
                params.classification.name === 'STAFF' &&
                params.groupBy === 'Location'
              ) {
                return e.name === levelsMap[3];
              } else {
                return e.name === levelsMap[params.classification.level];
              }
            })
          )
          .then((level) => level.id);
      };

      // const isEmpty = (x) => x.length === 0;

      const mapParams = (params, levelId) => {
        const o = _.omit([
          'filters',
          'groupBy',
          'dimensionSnapshotUuid',
          'classification',
        ])(params);

        if (params.groupBy || params.nestedGroupBy) {
          let a = params.groupBy;
          let b = params.nestedGroupBy;
          if (isString(a)) {
            a = a.split(',');
          }

          if (!_.isArray(a)) {
            a = [];
          }

          if (!_.isArray(b)) {
            b = [];
          }
          // final groupBy
          o.groupBy = mapGroupBy(a.concat(b));

          // map configurationid
          o.configId = params.dimensionSnapshotUuid;

          o.levelId = levelId;

          // swap groupby object for new API object properties to send;
          o.groupBy = swapGroupByProperties(o.groupBy);

          // exeption for location map group by;

          if (
            params.classification.name === 'STAFF' &&
            params.groupBy === 'Location'
          ) {
            o.groupBy.map((resource) => {
              return Object.assign(resource, {mapping: 'location'});
            });
          }
        }

        if (_.isArray(params.filters)) {
          o.filters = mapFilters(params.filters);
        }

        o.costParams = {
          groupBy: o.groupBy,
          filters: o.filters,
        };

        return o;
      };

      const getPath = (obj, keys, i = 0) => {
        if (i === keys.length) {
          return obj;
        }

        if (obj[keys[i]] === undefined) {
          obj[keys[i]] = {};
        }
        return getPath(obj[keys[i]], keys, i + 1);
      };

      const transformForLegacy = (params, accessor) => (res) => {
        const accessorValues = Object.values(accessor);

        const data = res.data.reduce((a, e) => {
          const keys = accessorValues.map((k) => e[k]);
          const path = getPath(a, keys);
          path[params.target] = {};
          path[params.target][params.accessor] = e.amount;
          return a;
        }, {});

        // const data2 = {
        //   A: {B: {amount: {sum: 100}}, C: {amount: {sum: 100}}},
        // };

        // console.log('DATAFORLEGPARAM', params);
        // console.log('DATAFORLEG', data);

        return {data: data};
      };

      const getAll = (params) => {
        console.log('params------', params);

        // map level
        let mappedParams;
        let accessor;
        return mapLevel(params).then((levelId) => {
          mappedParams = mapParams(params, levelId);
          console.log('mappedParams', mappedParams);
          accessor = getAccessor(mappedParams.groupBy);
          return costsService
            .getAll(
              mappedParams.configId,
              mappedParams.levelId,
              mappedParams.costParams
            )
            .then(transformForLegacy(params, accessor));
        });
      };

      return {getAll};
    },
  ]);
