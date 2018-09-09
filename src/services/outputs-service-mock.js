/**
 * Created by Sergiu Ghenciu on 14/05/2018
 */

'use strict';

angular
  .module('services.outputs-service', ['utils.misc'])
  .factory('outputsService', [
    'misc',
    '$q',
    (_, $q) => {
      const items = [
        {
          id: 1,
          configurationId: '1',
          instanceId: 'kjh4-hg34-f5g4',
          status: 'CREATED',
          message: '',
          name: 'Output 1',
          financialYearId: '1',
          outputTypeId: '2',
          startDate: '2017-10-16T20:50:50.084175+01:00',
          endDate: '2017-10-16T20:50:50.084175+01:00',
          createdBy: 'test@amalytics.co',
          creationDate: '2017-10-16T20:50:50.084175+01:00',
        },
        {
          id: 2,
          configurationId: '1',
          instanceId: 'kjh4-hg34-f5g5',
          status: 'CREATED',
          message: '',
          name: 'Output 2',
          financialYearId: '1',
          outputTypeId: '2',
          startDate: '2017-10-16T20:50:50.084175+01:00',
          endDate: '2017-10-16T20:50:50.084175+01:00',
          createdBy: 'test@amalytics.co',
          creationDate: '2017-10-16T20:50:50.084175+01:00',
        },
      ];

      const getAll = (configId) =>
        $q((resolve) => {
          resolve({data: items});
        });

      return {
        getAll,
      };
    },
  ]);
