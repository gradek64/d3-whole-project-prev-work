/**
 * Created by Sergiu Ghenciu on 11/04/2018
 *
 * The property `on` of the items means `toBePresentOn`
 *
 * !note: do not ever change the `id` of items.
 *
 */

'use strict';
// prettier-ignore
angular
  .module('services.report-groupbys-service', ['utils.misc'])
  .factory('reportGroupbysService', [
    'misc',
    function(_) {
      const groupBys = [
        {
          _id: 1,
          label: 'Legal Entity',
          value: 'SOURCE_LEGAL_ENTITY',
          on: [
            101, 1012, 1013, 10123, 10132, 1024, 10242, 10243, 201, 2012,
            2013, 20123, 20132, 2024, 20242, 20243, 301, 3012, 3013, 30123,
            30132, 3024, 30242, 30243, 111,
          ],
        },
        {
          _id: 2,
          label: 'Cost Centre',
          value: 'SOURCE_COST_CENTRE',
          on: [
            101, 1011, 1013, 10113, 10131, 1024, 10241, 10243, 201,
            2011, 2013, 20113, 20131, 2024, 20241, 20243, 301, 3011,
            3013, 30113, 30131, 3024, 30241, 30243, 111,
          ],
        },
        {
          _id: 3,
          label: 'Nominal',
          value: 'NOMINALS',
          on: [
            101, 1012, 1011, 10121, 10112, 1024, 10242, 10241, 201,
            2012, 2011, 20121, 20112, 2024, 20242, 20241, 301, 3012,
            3011, 30121, 30112, 3024, 30242, 30241, 111,
          ],
        },
        {
          _id: 4,
          label: 'Cost Pool',
          value: 'COST_POOL',
          on: [
            102, 1035, 10354, 202, 2035, 20354, 302, 3035, 30354, 112,
          ],
        },
        {
          _id: 5,
          label: 'Cost Category',
          value: 'COST_CATEGORY',
          on: [103, 203, 303, 113, 213, 313, 400],
        },
        {
          _id: 6,
          label: 'Functional Level 1',
          value: 'ITFBLevel1',
          on: [
            1024, 10246, 1035, 10356, 104, 2024, 20246, 2035, 20356,
            204, 3024, 30246, 3035, 30356, 304,

            114, 114.1, 114.2,
            114678, 11467, 1146,

            214, 214.1, 214.2,
            214678, 21467, 2146,

            314, 314.1, 314.2,
            314678, 31467, 3146,
          ],
        },
        {
          _id: 7,
          label: 'Functional Level 2',
          value: 'ITFBLevel2',
          on: [
            10246, 10356, 104, 20246, 20356, 204, 30246, 30356, 304,
            114, 114.1, 114.2,
            114678, 11467, 1146,

            214, 214.1, 214.2,
            214678, 21467, 2146,

            314, 314.1, 314.2,
            314678, 31467, 3146,
          ],
        },
        {
          _id: 8,
          label: 'Functional Level 3',
          value: 'ITFBLevel3',
          on: [
            10246, 10356, 104, 20246, 20356, 204, 30246, 30356, 304,
            114, 114.1, 114.2,
            114678, 11467, 1146,

            214, 214.1, 214.2,
            214678, 21467, 2146,

            314, 314.1, 314.2,
            314678, 31467, 3146,
          ],
        },
        {
          _id: 9,
          label: 'Service Type',
          value: 'SERVICE_TYPE',
          on: [
            105, 305,
            115.1, 11511, 11511.1, 11511.3, 115119,

            315.1, 31511, 31511.1, 31511.3, 315119,
          ],
        },
        {
          _id: 11,
          label: 'Service Name',
          value: 'SERVICE',
          on: [
            105, 106, 206, 305, 306,
            115, 115.1, 115.2,

            315, 315.1, 315.2,
          ],
        },
        {
          _id: 22,
          label: 'Service Group',
          value: 'SERVICE_GROUP',
          on: [
            105, 305,
            115.1,
            315.1,
          ],
        },
        {
          _id: 33,
          label: 'Target Cost Centre',
          value: 'TARGET_COST_CENTRE',
          on: [106, 206, 306],
        },
        {
          _id: 44,
          label: 'Role',
          value: 'ROLE',
          on: [
            1135, 113544, 2135, 213544, 3135, 313544,

            114678678, 11467867, 1146786,
            11467678, 1146767, 114676,
            1146678, 114667, 11466,
            11467867844, 1146786744, 114678644,
            1146767844, 114676744, 11467644,
            114667844, 11466744, 1146644,

            214678678, 21467867, 2146786,
            21467678, 2146767, 214676,
            2146678, 214667, 21466,
            21467867844, 2146786744, 214678644,
            2146767844, 214676744, 21467644,
            214667844, 21466744, 2146644,

            314678678, 31467867, 3146786,
            31467678, 3146767, 314676,
            3146678, 314667, 31466,
            31467867844, 3146786744, 314678644,
            3146767844, 314676744, 31467644,
            314667844, 31466744, 3146644,
          ],
        },
        {
          _id: 55,
          label: 'Vendor',
          value: 'VENDOR',
          on: [
            114678678, 11467867, 1146786,
            11467678, 1146767, 114676,
            1146678, 114667, 11466,
            11467867855, 1146786755, 114678655,
            1146767855, 114676755, 11467655,
            114667855, 11466755, 1146655,

            214678678, 21467867, 2146786,
            21467678, 2146767, 214676,
            2146678, 214667, 21466,
            21467867855, 2146786755, 214678655,
            2146767855, 214676755, 21467655,
            214667855, 21466755, 2146655,

            314678678, 31467867, 3146786,
            31467678, 3146767, 314676,
            3146678, 314667, 31466,
            31467867855, 3146786755, 314678655,
            3146767855, 314676755, 31467655,
            314667855, 31466755, 3146655,
          ],
        },
      ];

      const types = [
        {
          id: 'slider',
          on: [
            104, 204, 304,
            114, 114678, 11467, 1146,

            214, 214678, 21467, 2146,

            314, 314678, 31467, 3146,
          ],
        },
        {
          id: 'toggle',
          on: [],
        },
      ];

      /* pathId | groupById */
      const selectedMap = {
        10242: [1, 3],
        10246: [6, 7, 8],
        10241: [2, 3],
        10243: [1, 2],
        10356: [6, 7, 8],
        104: [6, 7, 8],
        105: [9, 11],
        106: [11, 33],

        20242: [1, 3],
        20246: [6, 7, 8],
        20241: [2, 3],
        20243: [1, 2],
        20356: [6, 7, 8],
        204: [6, 7, 8],
        206: [11, 33],

        30242: [1, 3],
        30246: [6, 7, 8],
        30241: [2, 3],
        30243: [1, 2],
        30356: [6, 7, 8],
        304: [6, 7, 8],
        305: [9, 11],
        306: [11, 33],

        115.1: [9, 11],
        315.1: [9, 11],

        114: [6, 7, 8],
        114678: [6, 7, 8],
        11467: [6, 7, 8],
        1146: [6, 7, 8],

        214: [6, 7, 8],
        214678: [6, 7, 8],
        21467: [6, 7, 8],
        2146: [6, 7, 8],

        314: [6, 7, 8],
        314678: [6, 7, 8],
        31467: [6, 7, 8],
        3146: [6, 7, 8],
      };

      const disabledMap = {
        102: [4],
        103: [5],
        105: [11],
        106: [11, 33],

        202: [4],
        203: [5],
        206: [11, 33],

        302: [4],
        303: [5],
        305: [11],
        306: [11, 33],

        112: [4],
        113: [5],
        213: [5],
        313: [5],
        115.1: [11],
        115.2: [11],
        115: [11],
        11511.3: [9],
        11511.1: [9],
        11511: [9],

        315.1: [11],
        315.2: [11],
        315: [11],
        31511.3: [9],
        31511.1: [9],
        31511: [9],

        400: [5],
      };

      const orderMap = {
        105: [9, 22, 11],
        305: [9, 22, 11],
        115.1: [9, 22, 11],
        315.1: [9, 22, 11],
        101: [1, 2, 3],
        111: [1, 2, 3],
        201: [1, 2, 3],
        301: [1, 2, 3],
      };

      const getType = (id) =>
        _.unless(
            _.undef,
            _.prop('id'),
            _.find(_.pipe(_.prop('on'), _.includes(id)), types));

      const includesAb = _.curry2(_.flip(_.includes));

      const assocFirst = _.curry3((prop, val, arr) =>
          _.prepend(_.assoc(prop, val, _.head(arr)), _.tail(arr)));

      const assocWhen = (prop, val, pred) =>
          _.map(_.when(pred, _.assoc(prop, val)));

      const propIsIncluded = (prop, arr) =>
          _.pipe(_.prop(prop), includesAb(arr));

      const markSelected = (selected) =>
          _.ifElse(
              _.always(_.undef(selected)),
              assocFirst('selected', true),
              assocWhen('selected', true, propIsIncluded('_id', selected)),
          );

      const markDisabled = (disabled) =>
          _.unless(
              _.always(_.undef(disabled)),
              assocWhen('disabled', true, propIsIncluded('_id', disabled)),
          );

      const sortByMapOrLabel = (map) =>
          _.ifElse(
              _.always(_.undef(map)),
              _.sortBy(_.ascend(_.pipe(_.prop('label'), _.toUpper))),
              _.sortOn((e) => _.indexOf(e._id, map)),
          );


      const getAll = (id) => {
        if (_.undef(id)) {
          return _.map(_.dissoc('on'), groupBys);
        }

        /* start-dev-block */
        let r = _.filter(_.pipe(_.prop('on'), _.includes(id)), groupBys);
        if (_.isNilOrEmpty(r)) {
          console.log('GROUPBYS', id, r);
        }
        /* end-dev-block */

        return _.pipe(
            _.filter(_.pipe(_.prop('on'), _.includes(id))),
            sortByMapOrLabel(orderMap[id]),
            markSelected(selectedMap[id]),
            markDisabled(disabledMap[id]),
            _.map(_.dissoc('on'))
        )(groupBys);
      };

      return {
        getAll,
        getType,
      };
    },
  ]);
