/**
 * Created by Sergiu Ghenciu on 09/04/2018
 */

'use strict';

angular
  .module('services.costs-service-total', ['utils.misc'])
  .factory('costsServiceTotal', [
    'misc',
    (_) => {
      const mapFilters = (items) =>
        items.reduce((a, e) => {
          a.push({resource: e.name, value: e.value, column: 'name'});
          return a;
        }, []);

      const mapGroupBy = (items) =>
        items.reduce((a, e) => {
          const o = {};
          o.resource = e.value;
          o.mapping = e.mapping ? e.mapping : 'name';
          a.push(o);
          return a;
        }, []);

      const mapParams = (params) => {
        const defaults = {};

        if (!_.def(params)) {
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

      const responseMiddleware = (res) => {
        const data = res.data.result || [];
        return {
          data: _.isArray(data) ? data : [data],
        };
      };

      const flattenData = (params) => (res) => {
        // console.log('flattenData', groupBys);
        const data = res.data.map((row) => {
          const o = {};
          o.id = '';

          if (_.isArray(row.resources)) {
            row.resources.forEach((e) => {
              o[e.resourceName] = e.value;
              o.id += `${e.resourceName},${e.value};`;
            });
          }

          o.amount = parseFloat(row.Amount, 10);

          return o;
        });
        return {data: data};
      };

      const amount = {result: {Amount: 6}};
      const mock = true;

      const getAll = (configId, levelId, params) => {
        let data = null;
        if (!mock) {
          data = api
            .post(
              '/model-srv/v2/configurations/' +
                configId +
                '/levels/' +
                levelId +
                '/costs',
              mapParams(params)
            )
            .then(responseMiddleware)
            .then(flattenData(params));
        } else {
          data = new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({data: amount});
            }, 2000);
          })
            .then(responseMiddleware)
            .then(flattenData(params));
        }

        return data;
      };

      return {
        getAll,
      };
    },
  ]);
