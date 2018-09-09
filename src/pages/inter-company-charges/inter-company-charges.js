/**
 * Created by Greg Gil on 08/02/2017
 */

'use strict';

angular
  .module('pages.inter-company-charges', [
    'ngRoute',
    'utils.events',
    'utils.constants',
    'services.report-components-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/inter-company-charges', {
        templateUrl: 'pages/inter-company-charges/inter-company-charges.html',
        controller: 'interCompanyChargesCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'inter-company-charges',
      });
    },
  ])
  .controller('interCompanyChargesCtrl', [
    'events',
    '$scope',
    '$route',
    'reportComponentsService',
    function(events, $scope, $route, reportComponentsService) {
      const init = (scope) => {
        // const level = 'ORGANISATION_CAPABILITIES'; // !!! (from legacy app)
        const page = $route.current.name;
        scope.page = page;
        const components = reportComponentsService.getAll(page);

        scope.component = components.find(
          (e) => e.id === 'inter-company-charges'
        );
      };

      init($scope);
    },
  ]);
