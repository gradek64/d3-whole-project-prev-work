/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('pages.home', ['ngRoute', 'utils.events', 'utils.constants'])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'home',
      });
    },
  ])
  .controller('HomeCtrl', [
    'events',
    '$scope',
    function(events, $scope) {
      $scope.items = [
        {
          title: 'Provider',
          icon: {name: 'provider'},
          url: '#!/provider',
        },
        {
          title: 'Consumer',
          icon: {name: 'consumer'},
          url: '#!/consumer',
        },
        {
          title: 'Analytics',
          icon: {name: 'analytics'},
          url: '#!/analytics',
        },
      ];
    },
  ]);
