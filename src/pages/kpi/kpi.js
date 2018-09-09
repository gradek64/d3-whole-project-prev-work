/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('pages.kpi', ['ngRoute', 'utils.events', 'utils.constants'])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/kpi', {
        templateUrl: 'pages/kpi/kpi.html',
        controller: 'kpiCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'kpi',
      });
    },
  ])
  .controller('kpiCtrl', [
    'events',
    '$scope',
    '$route',
    function(events, $scope, $route) {
      const augment = (scope) => {
        scope.page = $route.current.$$route.name;
      };

      const init = (scope) => {
        augment(scope);
      };

      init($scope);
    },
  ]);
