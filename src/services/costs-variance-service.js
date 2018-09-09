/**
 * Created by Sergiu Ghenciu on 13/06/2018
 */

'use strict';

angular
  .module('services.costs-variance-service', [
    'services.api-service',
    'utils.misc',
  ])
  .factory('costsVarianceService', [
    'apiService',
    'misc',
    '$q',
    (api, _, $q) => {
      const genericMock = [
        {
          primary: {
            amount: 500,
          },
          secondary: {
            amount: null,
          },
          difference: {
            amount: -500,
          },
          diffPercentage: {
            amount: null,
          },
          resources: [
            {
              resourceName: 'SERVICE',
              value: 'IBM Rational Bankcase',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'Technical Services ',
            },
          ],
        },
        {
          primary: {
            amount: 350,
          },
          secondary: {
            amount: 100,
          },
          difference: {
            amount: -250,
          },
          diffPercentage: {
            amount: -71.4,
          },
          resources: [
            {
              resourceName: 'SERVICE',
              value: 'RES Workspace Manager (France)',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'Technical Services ',
            },
          ],
        },
        {
          primary: {
            amount: null,
          },
          secondary: {
            amount: 600,
          },
          difference: {
            amount: 600,
          },
          diffPercentage: {
            amount: null,
          },
          resources: [
            {
              resourceName: 'SERVICE',
              value: 'AdminStudio',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'Technical Services ',
            },
          ],
        },
        {
          primary: {
            amount: 25,
          },
          secondary: {
            amount: 50,
          },
          difference: {
            amount: 25,
          },
          diffPercentage: {
            amount: 25,
          },
          resources: [
            {
              resourceName: 'SERVICE',
              value: 'Camtasia Studio',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'Technical Services ',
            },
          ],
        },
        {
          primary: {
            amount: 1050,
          },
          secondary: {
            amount: 450,
          },
          difference: {
            amount: -600,
          },
          diffPercentage: {
            amount: -57.1,
          },
          resources: [
            {
              resourceName: 'SERVICE',
              value: 'TOAD for Oracle',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'Technical Services ',
            },
          ],
        },
      ];

      const waterfallMock = [
        {
          primary: {
            amount: 500,
          },
          secondary: {
            amount: null,
          },
          difference: {
            amount: -500,
          },
          diffPercentage: {
            amount: null,
          },
          resources: [
            {
              resourceName: 'ITFBLevel1',
              value: 'New',
            },
            {
              resourceName: 'SERVICE',
              value: 'New',
            },
            {
              resourceName: 'SERVICE_GROUP',
              value: 'New',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'New',
            },
          ],
        },
        {
          primary: {
            amount: 350,
          },
          secondary: {
            amount: 100,
          },
          difference: {
            amount: -250,
          },
          diffPercentage: {
            amount: -71.4,
          },
          resources: [
            {
              resourceName: 'ITFBLevel1',
              value: 'Existing',
            },
            {
              resourceName: 'SERVICE',
              value: 'Existing',
            },
            {
              resourceName: 'SERVICE_GROUP',
              value: 'Existing',
            },
            {
              resourceName: 'SERVICE_TYPE',
              value: 'Existing',
            },
          ],
        },
      ];

      const scenario = [
        {
          primary: {
            amount: 500,
          },
          secondary: {
            amount: null,
          },
          difference: {
            amount: -500,
          },
          diffPercentage: {
            amount: null,
          },
          resources: [
            {
              resourceName: 'COST_CATEGORY',
              value: 'Staff',
            },
          ],
        },
        {
          primary: {
            amount: 500,
          },
          secondary: {
            amount: null,
          },
          difference: {
            amount: -500,
          },
          diffPercentage: {
            amount: null,
          },
          resources: [
            {
              resourceName: 'COST_CATEGORY',
              value: 'Contracts',
            },
          ],
        },
        {
          primary: {
            amount: 350,
          },
          secondary: {
            amount: 100,
          },
          difference: {
            amount: -250,
          },
          diffPercentage: {
            amount: -71.4,
          },
          resources: [
            {
              resourceName: 'COST_CATEGORY',
              value: 'Other',
            },
          ],
        },
      ];

      const parseOrNull = _.pipe(
        _.unless(_.isNil, parseFloat),
        _.defaultTo(null)
      );

      const defaultToName = _.defaultTo('name');

      const value = _.prop('value');

      const mapFilters = _.map((e) => {
        return {resource: e.name, value: value(e), column: 'name'};
      });

      const mapGroupBy = _.map((e) => {
        return {resource: value(e), mapping: defaultToName(e.mapping)};
      });

      // todo: it is unfinished
      const reportIdMap = {
        '115waterfall': 'SERVICES',
        '315waterfall': 'SERVICES',
        '215waterfall': 'SERVICES',
        '400waterfall': 'SCENARIO_SERVICES',

        '114waterfall': 'ITFB',
        '314waterfall': 'ITFB',
        '214waterfall': 'ITFB',
      };

      const mapParams = (params) => {
        let defaults = {};

        if (_.undef(params)) {
          return defaults;
        }

        let o = _.merge(params, defaults);

        if (params.filters) {
          o.filters = mapFilters(params.filters);
        }
        if (params.groupBy) {
          o.groupBy = mapGroupBy(params.groupBy);
        }

        let id = _.pipe(
          _.toString,
          _.split(''),
          _.take(3),
          _.append(params.reportType),
          _.join('')
        );

        o.outputFormat = reportIdMap[id(params.reportId)];

        return o;
      };

      const responseMiddleware = (res) => {
        const data = res.data.result || [];
        return {
          data: _.isArray(data) ? data : [data],
        };
      };

      const flattenData = (params) => (res) => {
        // console.log('------ flattenData', res);
        const data = _.map((row) => {
          let o = {};
          o.id = '';

          if (_.isArray(row.resources)) {
            row.resources.forEach((e) => {
              o[e.resourceName] = value(e);
              o.id += `${e.resourceName},${value(e)};`;
            });
          }

          o.primary = parseOrNull(row.primary.amount);
          o.secondary = parseOrNull(row.secondary.amount);
          o.difference = parseOrNull(row.difference.amount);
          o.diffPercentage = parseOrNull(row.diffPercentage.amount);

          return o;
        }, res.data);
        return {data: data};
      };

      const serverData = (params) => {
        // console.log('v2', params);
        if (_.identical('SCENARIO_SERVICES', params.outputFormat)) {
          return {data: {result: scenario}};
        }
        if (_.def(params.outputFormat)) {
          return {data: {result: waterfallMock}};
        }
        return {data: {result: genericMock}};
      };

      const getAll = (params) => {
        return $q((resolve) => {
          setTimeout(() => {
            resolve(serverData(mapParams(params)));
          }, 200);
        })
          .then(responseMiddleware)
          .then(flattenData(params));

        // api
        //   .post('/model-srv/v2/costs/variance', mapParams(params))
        //   .then(responseMiddleware)
        // .then(flattenData(params));
      };

      return {
        getAll,
      };
    },
  ]);
