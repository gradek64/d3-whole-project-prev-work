/**
 * Created by Greg on 08/12/2017
 */

'use strict';

angular
  .module('pages.landing-pages', ['ngRoute', 'utils.events', 'utils.constants'])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/consumer', {
          templateUrl: 'pages/landing-pages/landing-pages.html',
          controller: 'landingPagesCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'consumer',
        })
        .when('/provider', {
          templateUrl: 'pages/landing-pages/landing-pages.html',
          controller: 'landingPagesCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'provider',
        })
        .when('/analytics', {
          templateUrl: 'pages/landing-pages/landing-pages.html',
          controller: 'landingPagesCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'analytics',
        });
    },
  ])
  .controller('landingPagesCtrl', [
    'events',
    '$scope',
    '$route',
    function(events, $scope, $route) {
      const pagesContent = {
        provider: {
          title: 'Provider',
          items: [
            {
              icon: {name: 'itCostOverview'},
              title: 'Cost Overview',
              url: '#!/cost-overview',
              desc: 'Reports aimed at aiding cost control and optimization.',
            },
            {
              icon: {name: 'itServiceStatement'},
              title: 'Service Statement',
              url: '#!/service-statement',
              desc:
                'Reports articulating the cost of ' +
                'a particular selected IT Service.',
            },
            {
              icon: {name: 'kpi'},
              title: 'KPI',
              url: '#!/kpi',
              desc:
                'Key performance indicators showing' +
                ' the performance of the organization ' +
                'against industry standards.',
            },
            {
              icon: {name: 'analytics'},
              title: 'Analytics',
              url: '#!/analytics',
              desc:
                'Configurable reports to be used to' +
                ' perform advanced analysis of the data in the cost model.',
            },
            {
              icon: {name: 'myReports'},
              title: 'My Reports',
              url: '/',
              desc:
                'User configurable reports, including' +
                ' favorites and content preferences',
              disabled: true,
            },
          ],
        },

        consumer: {
          title: 'Consumer',
          items: [
            {
              icon: {name: 'departmentalCharges'},
              title: 'Departmental Charges',
              url: '#!/departmental-charges',
              desc:
                'Reports showing services and related costs' +
                ' allocated to consuming departments.',
            },
            {
              icon: {name: 'interCompanyCharges'},
              title: 'Inter Company Charges',
              url: '#!/inter-company-charges',
              desc:
                'Reports showing the flow of inter-company charges' +
                ' between legal entities/departments.',
            },
            {
              icon: {name: 'analytics'},
              title: 'Analytics',
              url: '#!/analytics',
              desc:
                'Report builder used to enable advanced' +
                ' analysis of the data in the cost model.',
            },
          ],
        },

        analytics: {
          title: 'Analytics',
          items: [
            {
              icon: {name: 'advancedAnalysis'},
              title: 'Power Mode',
              url: '#!/power-mode',
              desc:
                'Report builder used to enable advanced analysis' +
                ' of the data in the cost model.',
            },
            /* {
              icon: {name: 'costFlow'},
              title: 'Cost Flow',
              url: '#!/cost-flow',
              desc:
                'Sankey diagram showing flow of costs' +
                ' through stages of the cost model.',
            },*/
            {
              icon: {name: 'scenarioAnalytics'},
              title: 'Scenario Analytics',
              url: '#!/scenario-analytics',
              desc:
                'Diagram articulating the flow of' +
                ' inter-company charges between legal entities/departments.',
            },
          ],
        },
      };

      const init = (scope) => {
        scope.current = pagesContent[$route.current.$$route.name];
      };

      init($scope);
    },
  ]);
