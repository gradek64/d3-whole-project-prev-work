/**
 * Created by Sergiu Ghenciu on 27/04/2018
 *
 * The property `on` of the items means `toBePresentOn`
 *
 * reportIdService.id returns a unique id for a given report
 */

'use strict';

angular
  .module('services.report-navs-service', ['utils.misc'])
  .factory('reportNavsService', [
    'misc',
    function(_) {
      const items = [
        {
          _id: 1,
          id: 'general-ledger',
          label: 'General Ledger',
          on: [10, 30, 20, 11, 31, 21],
        },
        {
          _id: 2,
          id: 'cost-pools',
          label: 'Cost Pools',
          on: [10, 30, 20, 11, 31, 21],
        },
        {
          _id: 3,
          id: 'cost-category',
          label: 'Cost Category',
          on: [10, 30, 20, 11, 31, 21],
        },
        {
          _id: 4,
          id: 'functional',
          label: 'Functional',
          on: [10, 30, 20, 11, 31, 21],
        },
        {
          _id: 5,
          id: 'service-list',
          label: 'Service List',
          on: [10, 30, 11, 31],
        },
        {
          _id: 6,
          id: 'service-consumption',
          label: 'Service Consumption',
          on: [10, 30, 20, 11, 31, 21],
        },
      ];

      const getAll = (id) => {
        return _.pipe(
          _.when(
            _.always(_.def(id)),
            _.filter(_.pipe(_.prop('on'), _.includes(id)))
          ),
          _.map(_.dissoc('on'))
        )(items);
      };

      return {
        getAll,
      };
    },
  ]);
