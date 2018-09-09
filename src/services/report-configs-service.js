/**
 * Created by Sergiu Ghenciu on 29/06/2018
 *
 * The property `on` of the items means `toBePresentOn`
 *
 */

'use strict';
/* eslint-disable */
// prettier-ignore

angular
  .module('services.report-configs-service', [
    'utils.misc',
    'services.report-groupbys-service',
    'services.report-types-service'
  ])
  .factory('reportConfigsService', [
    'misc',
    'reportGroupbysService',
    'reportTypesService',
    function(_, reportGroupbysService, reportTypesService) {
      const configs = [
        {
          legend: true,
          labels: true,
          disableFilters: false,
          yLabel: 'Average Cost - (£)',
          on: [101, 201, 301, 102, 202, 302, 103, 203, 303]
        },
        {
          labels: true,
          legend: true,
          disableFilters: false,
          on: [104, 204, 304, 105, 305]
        },
        {
          labels: true,
          legend: true,
          disableFilters: false,
          on: [105, 305]
        },


        {
          disableToolbar: true,
          on: [
            1135, 2135, 3135,

            11467867844, 1146786744, 114678644,
            1146767844, 114676744, 11467644,
            114667844, 11466744, 1146644,
            11467867855, 1146786755, 114678655,
            1146767855, 114676755, 11467655,
            114667855, 11466755, 1146655,

            21467867844, 2146786744, 214678644,
            2146767844, 214676744, 21467644,
            214667844, 21466744, 2146644,
            21467867855, 2146786755, 214678655,
            2146767855, 214676755, 21467655,
            214667855, 21466755, 2146655,

            31467867844, 3146786744, 314678644,
            3146767844, 314676744, 31467644,
            314667844, 31466744, 3146644,
            31467867855, 3146786755, 314678655,
            3146767855, 314676755, 31467655,
            314667855, 31466755, 3146655
          ]
        },
        {
          disableFilters: false,
          on: [106, 206, 306, 113, 213, 313]
        },
        {
          disableHeader: true,
          on: [
            1012, 1011, 1013, 1024, 1035, 2012, 2011, 2013, 2024,
            2035, 3012, 3011, 3013, 3024, 3035
          ]
        },
        {
          disableFilters: true,
          disableToolbar: true,
          on: []
        },
        {
          disableFilters: false,
          disableHeader: true,
          disableToolbar: true,
          on: [
            10121, 10123, 10112, 10113, 10131, 10132, 10242, 10246,
            10241, 10243, 10354, 10356, 20121, 20123, 20112, 20113,
            20131, 20132, 20242, 20246, 20241, 20243, 20354, 20356,
            30121, 30123, 30112, 30113, 30131, 30132, 30242, 30246,
            30241, 30243, 30354, 30356,
            113544, 213544, 313544,

            115119,

            315119,
          ]
        },
        {
          maximumWaterfallBridges: 6,
          disableFilters: true,
          on: [112, 111]
        },


        {
          disableFilters: false,
          on: [
            114,
            115,

            214,

            315,
            314,
          ]
        },
        {
          on: [
            11511,

            114678, 11467, 1146,
            114678678, 11467867, 1146786,
            11467678, 1146767, 114676,
            1146678, 114667, 11466,

            214678, 21467, 2146,
            214678678, 21467867, 2146786,
            21467678, 2146767, 214676,
            2146678, 214667, 21466,

            31511,

            314678, 31467, 3146,
            314678678, 31467867, 3146786,
            31467678, 3146767, 314676,
            3146678, 314667, 31466,

            400
          ],
        }
      ];

      const titles = [
        {
          value: '${label}',
          on: [
            11467867844, 1146786744, 114678644,
            1146767844, 114676744, 11467644,
            114667844, 11466744, 1146644,
            11467867855, 1146786755, 114678655,
            1146767855, 114676755, 11467655,
            114667855, 11466755, 1146655,

            21467867844, 2146786744, 214678644,
            2146767844, 214676744, 21467644,
            214667844, 21466744, 2146644,
            21467867855, 2146786755, 214678655,
            2146767855, 214676755, 21467655,
            214667855, 21466755, 2146655,

            31467867844, 3146786744, 314678644,
            3146767844, 314676744, 31467644,
            314667844, 31466744, 3146644,
            31467867855, 3146786755, 314678655,
            3146767855, 314676755, 31467655,
            314667855, 31466755, 3146655
          ]
        },
        {
          value: 'Breakdown of ${label} by ${groupBy}',
          on: [
            11511,

            114678, 11467, 1146,
            114678678, 11467867, 1146786,

            214678, 21467, 2146,
            214678678, 21467867, 2146786,

            31511,

            314678, 31467, 3146,
            314678678, 31467867, 3146786
          ]
        },
        {
          value: 'Breakdown by General Ledger',
          on: [101, 201, 301, 111]
        },
        {
          value: 'Breakdown by Cost Pools',
          on: [102, 202, 302, 112]
        },
        {
          value: 'Breakdown by Cost Category',
          on: [103, 203, 303, 113, 213, 313]
        },
        {
          value: 'Functional',
          on: [
            104, 204, 304,
            114,
            214,
            314,
          ]
        },
        {
          value: 'Service List',
          on: [
            105, 305,
            115,

            315,
          ]
        },
        {
          value: 'Service Consumption',
          on: [106, 206, 306]
        },


      ];

      const subtitles = [
        {
          value:
            'Viewing ${amount} ${dir}, ${percent} ${dir} from Primary to Secondary',
          on: [
            11511,

            114678, 11467, 1146,

            214678, 21467, 2146,

            31511,

            314678, 31467, 3146,
          ]
        },
        {
          value:
              'Chart showing total IT costs allocated to the departed per selected attribute contained in the General Ledger input data.',
          on: [101]
        },
        {
          value:
              'Chart showing total IT costs allocated to the departed per cost pool categorization.',
          on: [102]
        },
        {
          value: 'Chart showing total IT costs per category of costs.',
          on: [103]
        },
        {
          value:
              'Chart displaying the total cost base per Functional Breakdown and subcomponents. Select outer blocks to drill down and center of chart to return.',
          on: [104]
        },
        {
          value:
              'Chart displaying the total IT costs per types of service and the services themselves. Select outer blocks to drill down and center of chart to return.',
          on: [105]
        },
        {
          value:
              'Sankey diagram displaying flow of costs of the services to the consuming department/s.',
          on: [106]
        },
        {
          value:
              'Chart showing service costs per selected attribute contained in the General Ledger input data.',
          on: [201]
        },
        {
          value: 'Chart showing service costs per cost pool categorization.',
          on: [202]
        },
        {
          value: 'Chart showing service costs per category of costs.',
          on: [203]
        },
        {
          value:
              'Chart displaying the service cost base per Functional Breakdown and subcomponents. Select outer blocks to drill down and center of chart to return.',
          on: [204]
        },
        {
          value:
              'Sankey diagram displaying flow of costs of the service allocated to the service consumers.',
          on: [206]
        },
        {
          value:
              'Chart showing cost of the services allocated to the department per selected attribute contained in the General Ledger input data.',
          on: [301]
        },
        {
          value:
              'Chart showing cost of the services allocated to the department per cost pool categorization.',
          on: [302]
        },
        {
          value:
              'Chart showing cost of the services allocated to the department per category of costs.',
          on: [303]
        },
        {
          value:
              "Chart displaying the department's cost base per Functional Breakdown and subcomponents. Select outer blocks to drill down and center of chart to return.",
          on: [304]
        },
        {
          value:
              'Chart displaying the types of service and the services themselves allocated to the selected department. Select outer blocks to drill down and center of chart to return.',
          on: [305]
        },
        {
          value:
              'Sankey diagram displaying flow of costs of the services allocated to the consuming department/s.',
          on: [306]
        }
      ];

      const unlessUndefPropValue = _.unless(_.undef, _.prop('value'));

      const getOne = id => {
        // console.log('variations(id)', _.idVariations(id));
        const find = _.find(_.pipe(_.prop('on'), _.includes(id)));

        let config = find(configs);

        if (_.undef(config)) {
          /* start-dev-block */
          console.log('CONFIG', id, config);
          /* end-dev-block */
          return;
        }

        config = _.dissoc('on', config);

        config.title = unlessUndefPropValue(find(titles));
        config.subtitle = unlessUndefPropValue(find(subtitles));
        config.groupByButtons = reportGroupbysService.getAll(id);
        config.groupByType = reportGroupbysService.getType(id);
        config.types = reportTypesService.getAll(id);

        return config;
      };

      return {
        getOne
      };
    }
  ]);
