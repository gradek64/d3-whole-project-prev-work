/**
 * Created by Sergiu Ghenciu on 23/02/2018
 */

'use strict';
/* eslint-disable */
angular
  .module('services.costs-service-mock', ['utils.misc'])
  .factory('costsServiceMock', [
    'misc',
    '$q',
    (_, $q) => {
      const mapFilters = items =>
        items.reduce((a, e) => {
          a.push({ resource: e.name, value: e.value, column: 'name' });
          return a;
        }, []);

      const mapGroupBy = items =>
        items.reduce((a, e) => {
          a.push({ resource: e.value, mapping: 'name' });
          return a;
        }, []);

      const mapParams = params => {
        const defaults = {};

        if (!params) {
          return defaults;
        }

        const o = Object.assign(defaults, params);

        if (params.filters) {
          o.filters = mapFilters(params.filters);
        }
        if (params.groupBy) {
          o.groupBy = mapGroupBy(params.groupBy);
        }

        return o;
      };

      const items = [
        {
          id: 'SOURCE_LEGAL_ENTITY,LE07;',
          SOURCE_LEGAL_ENTITY: 'LE07',
          amount: 422611.11123333336,
          percentage: 9.066638063167977
        },
        {
          id: 'SOURCE_LEGAL_ENTITY,LE06;',
          SOURCE_LEGAL_ENTITY: 'LE06',
          amount: 422611.11123333336,
          percentage: 9.066638063167977
        },
        {
          id: 'SOURCE_LEGAL_ENTITY,LE05;',
          SOURCE_LEGAL_ENTITY: 'LE05',
          amount: 422611.11123333336,
          percentage: 9.066638063167977
        },
        {
          id: 'SOURCE_LEGAL_ENTITY,LE02;',
          SOURCE_LEGAL_ENTITY: 'LE02',
          amount: 575166.6667,
          percentage: 12.339543032242807
        },
        {
          id: 'SOURCE_LEGAL_ENTITY,LE04;',
          SOURCE_LEGAL_ENTITY: 'LE04',
          amount: 940833.3333699999,
          percentage: 20.18450316305084
        },
        {
          id: 'SOURCE_LEGAL_ENTITY,LE01;',
          SOURCE_LEGAL_ENTITY: 'LE01',
          amount: 938666.6667,
          percentage: 20.138019807601218
        },
        {
          id: 'SOURCE_LEGAL_ENTITY,LE03;',
          SOURCE_LEGAL_ENTITY: 'LE03',
          amount: 938666.6667,
          percentage: 20.138019807601218
        }
      ];

      const getAll = (configId, levelId, params) => {
        const groupBys = mapParams(params).groupBy;

        return $q((resolve, reject) => {
          setTimeout(() => {
            resolve({
              data: items
            });
          }, 20);
        });
      };

      return {
        getAll
      };
    }
  ]);
