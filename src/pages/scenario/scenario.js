/**
 * Created by Greg on 08/12/2017
 */

'use strict';

angular
  .module('pages.scenario', [
    'ngRoute',
    'utils.events',
    'utils.constants',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/scenario-analytics', {
          templateUrl: 'pages/scenario/scenario.html',
          controller: 'scenarioCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'scenario-analytics',
        })
        .when('/scenario-analytics/:action', {
          templateUrl: 'pages/scenario/scenario.html',
          controller: 'scenarioCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'scenario-analytics-remove',
        });
    },
  ])
  .controller('scenarioCtrl', [
    'events',
    '$scope',
    '$route',
    function(events, $scope, $route) {
      const augment = (scope) => {
        scope.pageName = $route.current.$$route.name;

        const pageIconMap = {
          'scenario-analytics': {
            title: 'Select a scenario',
            items: [
              {
                icon: {name: 'delete', color: 'white'},
                hoverIconUrl: 'icon-green/removes',
                title: 'Remove',
                url: '#!/scenario-analytics/remove',
              },
              {
                icon: {name: 'replaceScenario', color: 'white'},
                hoverIconUrl: 'icon-green/replaceScenario',
                title: 'Replace',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'plus', color: 'white'},
                hoverIconUrl: 'icon-green/add',
                title: 'Add',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'enhanceScenario', color: 'white'},
                hoverIconUrl: 'icon-green/enhanceScenario',
                title: 'Enhance',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'mergeScenario', color: 'white'},
                hoverIconUrl: 'icon-green/mergeScenario',
                title: 'Merge',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'migrateScenario', color: 'white'},
                hoverIconUrl: 'icon-green/migrateScenario',
                title: 'Migrate',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
            ],
          },
          'scenario-analytics-remove': {
            title: 'Remove Scenario',
            breadcrumbs: [
              {
                href: '/#!/scenario-analytics',
                label: 'Scenario Analytics',
              },
              {
                href: '/#!/scenario-analytics/remove',
                label: 'Remove',
              },
            ],
            items: [
              {
                icon: {name: 'scenarioProcesses', color: 'white'},
                title: 'Processes',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'svgContracts', color: 'white'},
                title: 'Contracts',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'svgServices', color: 'white'},
                title: 'Services',
                url: '#!/scenario-analytics/remove/services',
              },
              {
                icon: {name: 'svgLabour', color: 'white'},
                title: 'Staff',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'svgInfrastructure', color: 'white'},
                title: 'Infrastructure',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
              {
                icon: {name: 'svgCapabilities', color: 'white'},
                title: 'Capabilities',
                url: '#!/scenario-analytics/remove',
                disabled: true,
              },
            ],
          },
        };
        scope.page = {
          title: pageIconMap[scope.pageName].title,
          items: pageIconMap[scope.pageName].items,
          breadcrumbs: pageIconMap[scope.pageName].breadcrumbs,
        };
      };

      const init = (scope) => {
        augment(scope);
      };

      init($scope);
    },
  ]);
