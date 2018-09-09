/**
 * Created by Greg on 08/12/2017
 */

'use strict';

angular
  .module('components.top-nav-map', ['components.top-nav', 'utils.misc'])
  .directive('topNavMap', [
    'misc',
    (_) => {
      const link = (scope) => {
        /* scope.opts.page = 'departmental-charges';*/

        const reportMap = {
          'cost-overview': 'Provider',
          'service-statement': 'Provider',
          'kpi': 'Provider',
          'analytics': 'Provider',
          'my-reports-provider': 'Provider',
          'departmental-charges': 'Consumer',
          'inter-company-charges': 'Consumer',
          'analytics': 'Consumer',
          'my-reports-consumer': 'Consumer',
          'analytics': 'Analytics',
          'cost-flow': 'Analytics',
          'scenario-analytics': 'Analytics',
          'advanced-analysis': 'Analytics',
          'remove-scenario': 'Analytics',
        };

        // scenario analytics pages;
        scope.opts.page = /scenario/.test(scope.opts.page)
          ? 'scenario-analytics'
          : scope.opts.page;

        scope.options = {title: reportMap[scope.opts.page]};

        const links = [
          {
            name: 'cost-overview',
            icon: {name: 'itCostOverview', color: 'white'},
            href: '/#!/cost-overview',
            label: 'Cost Overview',
            toBePresentOn: [
              'cost-overview',
              'service-statement',
              'kpi',
              'analytics',
              'my-reports',
            ],
          },

          {
            name: 'service-statement',
            icon: {name: 'itServiceStatement', color: 'white'},
            href: '/#!/service-statement',
            label: 'Service Statement',
            toBePresentOn: [
              'cost-overview',
              'service-statement',
              'kpi',
              'analytics',
              'my-reports',
            ],
          },

          {
            name: 'kpi',
            icon: {name: 'kpi', color: 'white'},
            href: '/#!/kpi/',
            label: 'KPI',
            toBePresentOn: [
              'cost-overview',
              'service-statement',
              'kpi',
              'analytics',
              'my-reports',
            ],
          },

          {
            name: 'analytics',
            icon: {name: 'analytics', color: 'white'},
            href: '#!/analytics',
            label: 'Analytics',
            order: 2,
            toBePresentOn: [
              'cost-overview',
              'service-statement',
              'kpi',
              'analytics',
              'my-reports',
              'inter-company-charges',
              'departmental-charges',
              'cost-flow',
            ],
          },
          {
            name: 'advanced-analysis',
            icon: {name: 'advancedAnalysis', color: 'white'},
            href: '#!/power-mode',
            label: 'Power Mode',
            order: 2,
            toBePresentOn: [
              'advanced-analysis',
              'scenario-analytics',
              'remove-scenario',
            ],
          },

          {
            name: 'my-reports',
            icon: {name: 'myReports', color: 'white'},
            href: '/#!/my-reports',
            label: 'My Reports',
            disabled: true,
            order: 3,
            toBePresentOn: [
              'cost-overview',
              'service-statement',
              'kpi',
              'analytics',
              'my-reports',
              'inter-company-charges',
              'departmental-charges',
              'analytics',
            ],
          },

          {
            name: 'departmental-charges',
            icon: {name: 'departmentalCharges', color: 'white'},
            href: '/#!/departmental-charges',
            label: 'Departmental Charges',
            order: 0,
            toBePresentOn: [
              'departmental-charges',
              'inter-company-charges',
              'analytics',
              'my-reports',
            ],
          },

          {
            name: 'inter-company-charges',
            icon: {name: 'interCompanyCharges', color: 'white'},
            href: '/#!/inter-company-charges/',
            label: 'Inter Company Charges',
            order: 1,
            toBePresentOn: [
              'departmental-charges',
              'inter-company-charges',
              'analytics',
              'my-reports',
            ],
          },

          {
            name: 'cost-flow',
            icon: {name: 'costFlow', color: 'white'},
            href: '/#!/cost-flow',
            label: 'Cost Flow',
            toBePresentOn: [],
          },

          {
            name: 'scenario-analytics',
            icon: {name: 'scenarioAnalytics', color: 'white'},
            href: '/#!/scenario-analytics',
            label: 'Scenario Analytics',
            toBePresentOn: [
              'cost-flow',
              'scenario-analytics',
              'remove-scenario',
              'advanced-analysis',
            ],
          },
        ];

        scope.items = links.filter((e) =>
          e.toBePresentOn.includes(scope.opts.page)
        );

        if (reportMap[scope.opts.page] === 'Consumer') {
          scope.items.sort(_.compareFactory('order', false, true));
        }

        const index = scope.items.findIndex((e) => e.name === scope.opts.page);
        if (index !== -1) {
          scope.items[index].active = true;
        }
      };
      return {
        restrict: 'EA',
        scope: {
          opts: '=',
        },
        template: `<top-nav opts="options" items="items"></top-nav>`,
        link: link,
      };
    },
  ]);
