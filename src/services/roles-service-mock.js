/**
 * Created by Sergiu Ghenciu on 14/05/2018
 */

'use strict';
angular
  .module('services.roles-service', ['utils.misc'])
  .factory('rolesService', [
    'misc',
    '$q',
    (_, $q) => {
      const getAll = () => {
        return $q((resolve) => {
          resolve({data: ['SEE', 'USER_MANAGEMENT', 'admin']});
        });
      };

      return {
        getAll,
      };
    },
  ]);
