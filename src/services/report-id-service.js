/**
 * Created by Sergiu Ghenciu on 27/04/2018
 *
 * Id is formed based on the path. Below are some examples:
 *
 * cost-overview + nonVariance = 10
 * cost-overview + isVariance = 11
 *
 * cost-overview + nonVariance + general-ledger = 101
 * cost-overview + nonVariance + general-ledger + SOURCE_LEGAL_ENTITY = 1011
 * cost-overview + nonVariance + general-ledger + SOURCE_LEGAL_ENTITY
 * + NOMINALS = 10113
 *
 */

'use strict';

angular
  .module('services.report-id-service', [
    'utils.misc',
    'services.report-navs-service',
    'services.report-groupbys-service',
    'services.report-types-service',
  ])
  .factory('reportIdService', [
    'misc',
    'reportNavsService',
    'reportGroupbysService',
    'reportTypesService',
    function(_, reportNavsService, reportGroupbysService, reportTypesService) {
      const defaultTo0 = _.defaultTo('0');

      const createMap = (prop1, prop2, arr) =>
        _.reduce(
          (a, e) => {
            a[e[prop1]] = e[prop2];
            return a;
          },
          {},
          arr
        );

      const pageMap = {
        'cost-overview': 1,
        'service-statement': 2,
        'departmental-charges': 3,
        'scenario-remove-report': 4,
      };

      /**
       * `navMap` is a value-to-id map
       * e.g.
       * {
       *  general-ledger: 1,
       *  cost-pools: 2,
       *  ...
       * }
       */
      const navMap = createMap('id', '_id', reportNavsService.getAll());

      /**
       * `groupByMap` is a value-to-id map
       * e.g.
       * {
       *  SOURCE_LEGAL_ENTITY: 1,
       *  SOURCE_COST_CENTRE: 2,
       *  NOMINALS: 3,
       *  ...
       * }
       */
      const groupByMap = createMap(
        'value',
        '_id',
        reportGroupbysService.getAll()
      );

      /**
       * `typeMap` is a value-to-id map
       * e.g.
       * {
       *  table: 1,
       *  waterfall: 2,
       *  ...
       * }
       */
      const typeMap = createMap('value', 'id', reportTypesService.getAll());

      /* start-dev-block */
      const anyEq0 = _.any(_.pipe(_.toString, _.identical('0')));

      if (anyEq0(_.values(pageMap))) {
        throw Error('pageMap contains value `0` (value `0` is reserved)');
      }
      if (anyEq0(_.values(navMap))) {
        throw Error('navMap contains value `0` (value `0` is reserved)');
      }
      if (anyEq0(_.values(typeMap))) {
        throw Error('typeMap contains value `0` (value `0` is reserved)');
      }
      if (anyEq0(_.values(groupByMap))) {
        throw Error('groupByMap contains value `0` (value `0` is reserved)');
      }
      /* end-dev-block */

      const id = (page, isVariance, nav, groupBys) => {
        /* start-dev-block */
        if (_.undef(pageMap[page])) {
          throw Error(`pageMap['${page}'] is undefined`);
        }
        /* end-dev-block */

        let str = _.toString(pageMap[page]);

        str += isVariance ? '1' : '0';

        str += defaultTo0(navMap[nav]);

        if (_.def(groupBys)) {
          str += _.join('', _.map((e) => groupByMap[e.value], groupBys));
        }

        /* start-dev-block */
        console.log(
          'ID for (',
          page,
          isVariance ? 'variance' : 'nonVariance',
          nav,
          groupBys,
          ') :',
          str
        );
        /* end-dev-block */
        return parseInt(str);
      };

      const typeId = (type) => typeMap[type];

      return {
        id,
        typeId,
      };
    },
  ]);
