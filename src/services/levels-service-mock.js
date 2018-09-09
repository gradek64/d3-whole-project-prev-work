/**
 * Created by Sergiu Ghenciu on 14/05/2018
 */

'use strict';

//

angular
  .module('services.levels-service', ['utils.misc'])
  .factory('levelsService', [
    'misc',
    '$q',
    (_, $q) => {
      const items = [
        {
          name: 'Source',
          id: 'a3d562e5-6ac5-41dc-ab6f-aaad61eba0b3',
          levelDbId: '48',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '0',
        },
        {
          name: 'Infrastructure 1',
          id: 'c81f6a3a-083a-4956-adb1-20307ead10a2',
          levelDbId: '51',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '3',
        },
        {
          name: 'Infrastructure 3',
          id: '94f34360-03d5-4b79-921a-c30cbd0da32e',
          levelDbId: '53',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '5',
        },
        {
          name: 'Target',
          id: 'e4154acf-4c9f-40fa-894b-90834b8fd01f',
          levelDbId: '55',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '7',
        },
        {
          name: 'Entitlement',
          id: '4027cb6c-71e9-4339-a868-5fb58a25d861',
          levelDbId: '49',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '1',
        },
        {
          name: 'Functional',
          id: '9845d5e7-bda0-466e-bc49-a18f5e4a0023',
          levelDbId: '50',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '2',
        },
        {
          name: 'Infrastructure 2',
          id: '5199b35b-d181-48a8-a00b-b6ee28e4bcec',
          levelDbId: '52',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '4',
        },
        {
          name: 'Services',
          id: 'c1bb58d3-5a95-4e99-8e0d-483a69a0c839',
          levelDbId: '54',
          configurationUuid: '37315bdc-4f55-4df5-8ec9-e530f91f9051',
          order: '6',
        },
      ];

      const getAll = (id, params, server = 'configuration-srv') =>
        $q((resolve) => {
          resolve({data: items});
        });

      return {
        getAll,
      };
    },
  ]);
