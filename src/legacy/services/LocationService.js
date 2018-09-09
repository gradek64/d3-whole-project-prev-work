/**
 * Created by Sergiu Ghenciu on 26/03/2018
 */

'use strict';
/* eslint-disable */
angular
  .module('services.roles-service', ['services.api-service'])
  .factory('mapLocationService', [
    'apiService',
    api => {
      const responseMiddleware = res => {
        const d = res.data;
        d.push('admin'); // hardcoded by now
        return {
          data: res.data || []
        };
      };

      const getLocation = id =>
        api.get('/auth/v2/users/' + id + '/roles').then(responseMiddleware);

      // const getLocation = () => {
      //   return new Promise(resolve => {
      //     resolve({ data: ['USER_MANAGEMENT', 'admin'] });
      //   });
      // };

      return {
        getLocation
      };
    }
  ]);
