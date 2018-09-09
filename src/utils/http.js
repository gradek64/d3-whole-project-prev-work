/**
 * Created by Sergiu Ghenciu on 18/12/2017
 */

'use strict';

angular.module('utils.http', []).factory('http', [
  '$http',
  ($http) => {
    const send = (config) => $http(config);

    return {
      send,
    };
  },
]);
