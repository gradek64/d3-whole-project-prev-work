/**
 * Created by Sergiu Ghenciu on 08/01/2018
 */

'use strict';

angular
  .module('services.outputs-service', ['services.api-service', 'utils.misc'])
  .factory('outputsService', [
    'misc',
    'apiService',
    (_, api) => {
      const mapParams = ({
        pagination = {start: 0, number: 200},
        sort = {},
        search,
      } = {}) => {
        const config = {};
        config.headers = {};
        config.headers['x-amalytics-range'] =
          pagination.start + '-' + (pagination.start + pagination.number);
        // config.headers['x-amalytics-range'] = '0-6';
        if (sort.predicate) {
          config.headers['x-amalytics-sort'] = sort.predicate;
          config.headers['x-amalytics-sort-direction'] = sort.reverse
            ? 'DESC'
            : 'ASC';
        }

        return config;
      };

      /* const mock = [
        {
          id: 1,
          configurationId: '1',
          instanceId: 'kjh4-hg34-f5g4',
          status: 'REQUESTED',
          message: '',
          name: 'My First Job',
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
          status: 'REQUESTED',
          message: '',
          name: 'My Second Job',
          financialYearId: '1',
          outputTypeId: '2',
          startDate: '2017-10-16T20:50:50.084175+01:00',
          endDate: '2017-10-16T20:50:50.084175+01:00',
          createdBy: 'test@amalytics.co',
          creationDate: '2017-10-16T20:50:50.084175+01:00',
        },
      ];*/

      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
          // data: mock,
        };
      };

      const create = (configId, doc) => {
        return api.post(
          '/configuration-srv/v2/configurations/' + configId + '/job',
          doc
        );
      };

      const update = (configId, jobId, doc) => {
        return api.patch(
          '/configuration-srv/v2/configurations/' + configId + '/jobs/' + jobId,
          doc
        );
      };

      const del = (configId, jobId) => {
        return api.delete(
          '/configuration-srv/v2/configurations/' + configId + '/jobs/' + jobId
        );
      };

      const getStages = () =>
        api
          .get('/configuration-srv/v2/stages', mapParams())
          .then(responseMiddleware);

      const mocks = true;
      const outputs = [
        {
          id: 17,
          configurationId: 20017,
          instanceId: '49a15683-b0ba-4e1b-8b92-b46ba7d61aeb',
          status: 'CREATED',
          message: 'CREATED',
          name: 'NormalPathScenarioJob11531926071',
          financialYearId: 1,
          outputTypeId: 1,
          startDate: '2018-07-18T15:01:44.656Z',
          endDate: '2018-07-18T15:02:46.179Z',
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:01:44.642Z',
        },
        {
          id: 17,
          configurationId: 20017,
          instanceId: '49a15683-b0ba-4e1b-8b92-b46ba7d61aeb',
          status: 'CREATED',
          message: 'CREATED',
          name: 'NormalPathScenarioJob11531926071',
          financialYearId: 1,
          outputTypeId: 1,
          startDate: '2018-07-18T15:01:44.656Z',
          endDate: '2018-07-18T15:02:46.179Z',
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-07-18T15:01:44.642Z',
        },
      ];

      const getAll = (configId) => {
        if (mocks) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({
                data: outputs,
              });
            }, 10);
          }).then(responseMiddleware);
        }

        if (_.undef(configId)) {
          return api
            .get('/configuration-srv/v2/configurations/jobs', mapParams())
            .then((res) => {
              console.log('outputs', res);
              return res;
            })
            .then(responseMiddleware);
        }

        return api
          .get(
            '/configuration-srv/v2/configurations/' + configId + '/jobs',
            mapParams()
          )
          .then(responseMiddleware);
      };

      return {
        getAll,
        getStages,
        create,
        update,
        delete: del,
      };
    },
  ]);
