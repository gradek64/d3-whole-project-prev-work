/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('pages.service-statement', [
    'ngRoute',
    'utils.events',
    'utils.constants',
    'services.report-navs-service',
    'services.report-id-service',
    'services.report-levels-service',
    'services.settings-service',
    'services.levels-service',
    'services.costs-service',
    'utils.chart-data-format',
    'utils.misc',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/service-statement/variance/:component?', {
          templateUrl: 'pages/service-statement/service-statement.html',
          controller: 'serviceStatementCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
            isVariance: true,
          },
          name: 'service-statement',
          reloadOnSearch: false,
        })
        .when('/service-statement/:component?', {
          templateUrl: 'pages/service-statement/service-statement.html',
          controller: 'serviceStatementCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ALL],
          },
          name: 'service-statement',
          reloadOnSearch: false,
        });
    },
  ])
  .controller('serviceStatementCtrl', [
    'events',
    '$scope',
    '$route',
    '$routeParams',
    '$location',
    'reportNavsService',
    'reportLevelService',
    'reportIdService',
    'settingsService',
    'CONSTANTS.EVENTS',
    'levelsService',
    'costsService',
    'chartDataFormat',
    'misc',
    function(
      events,
      $scope,
      $route,
      $routeParams,
      $location,
      reportNavsService,
      reportLevelService,
      reportIdService,
      settingsService,
      EVENTS,
      levelsService,
      costsService,
      cdf,
      _
    ) {
      const configId = (output) => output.instanceId;

      const levelId = (levels, {id}) => {
        return _.prop('id', levels.find((e) => e.name === id));
      };

      const prefix = (page, isVariance) =>
        isVariance ? page + '/variance' : page;

      const mapFilters = (state) => {
        if (state) {
          return [
            {name: 'SERVICE_TYPE', value: state.first.value},
            {name: 'SERVICE_GROUP', value: state.second.value},
            {name: 'SERVICE', value: state.third.value},
          ].filter((e) => _.def(e.value));
        }

        return state;
      };

      const writeQueryString = (id, value) => {
        if (value !== null) {
          value = btoa(JSON.stringify(value));
        }
        $location.search(id, value);
      };

      const readQueryString = (id) => {
        const qs = $location.search();
        return qs[id] ? JSON.parse(atob(qs[id])) : null;
      };

      const initNav = (scope, page, isVariance, componentId, navs) => {
        const x = '/#!/' + prefix(page, isVariance);

        const qs = $location.search();
        const queryStr = qs.filters ? `?filters=${qs.filters}` : '';

        scope.navs = navs.map((e) => {
          return {
            label: e.label,
            href: x + '/' + e.id + queryStr,
            active: e.id === componentId,
          };
        });
      };

      const initLevels = (scope, isSecondary) => {
        const key = isSecondary ? 'levels2' : 'levels1';
        scope[key] = null; // needed for triggering the re-rendering
        return levelsService
          .getAll(
            configId(_.prop(isSecondary ? 'output2' : 'output1', scope)),
            undefined,
            'model-srv'
          )
          .then((res) => {
            // console.log('level', res);
            scope[key] = res.data;
            // console.log('level', scope.level);
            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$digest();
            }
            return scope;
          });
      };

      const initTotal = (scope) => {
        console.log('init total', scope.filters);
        costsService
          .getAll(
            configId(scope.output1),
            levelId(scope.levels1, reportLevelService.getOne('Services')),
            {
              filters: scope.filters,
            }
          )
          .then((res) => {
            const val = res.data[0].amount;
            scope.total = cdf.formatCurrency(val, val < 0, '£');

            if (!scope.$$phase && !scope.$root.$$phase) {
              scope.$digest();
            }
          });
      };

      const redirect = (page, isVariance, componentId) => {
        const qs = $location.search();
        const queryStr = qs.filters ? qs.filters : null;

        $location
          .path('/' + prefix(page, isVariance) + '/' + componentId)
          .search('filters', queryStr);
      };

      const bindEvents = (scope, page, isVariance, componentId, navs) => {
        const onOutput1Change = (output) => {
          scope.output1 = output;
          initLevels(scope).then(initTotal);
        };

        const onOutput2Change = (output) => {
          scope.output2 = output;
          initLevels(scope, true);
        };

        const onFiltersChange = (state) => {
          // console.log('filters changed: ', state);
          scope.filters = null;
          setTimeout(() => {
            scope.urlFilters = state;
            scope.filters = mapFilters(state);
            writeQueryString('filters', state);

            initNav(scope, page, isVariance, componentId, navs);
            initTotal(scope);
          }, 0);
        };

        events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutput1Change);
        events.on(EVENTS.SECONDARY_OUTPUT_CHANGED, onOutput2Change);
        events.on(EVENTS.FILTERS_CHANGED, onFiltersChange);
        scope.$on('$destroy', () => {
          events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutput1Change);
          events.off(EVENTS.SECONDARY_OUTPUT_CHANGED, onOutput2Change);
          events.off(EVENTS.FILTERS_CHANGED, onFiltersChange);
        });
      };

      const augment = (scope, page, isVariance, componentId) => {
        scope.toggleCallback = (state) => {
          redirect(page, state, componentId);
        };
        scope.useV2 = _.either(
          _.identical('service-list'),
          _.identical('functional')
        );
      };

      const firstTwo = _.pipe(_.moveDecimal(2), Math.floor);

      const init = (scope) => {
        const page = $route.current.name;
        const isVariance = $route.current.data.isVariance;
        const navs = reportNavsService.getAll(
          firstTwo(reportIdService.id(page, isVariance))
        );
        const componentId = $routeParams.component;

        if (!componentId) {
          return redirect(page, isVariance, navs[0].id);
        }

        augment(scope, page, isVariance, componentId);
        initNav(scope, page, isVariance, componentId, navs);
        bindEvents(scope, page, isVariance, componentId, navs);

        scope.urlFilters = readQueryString('filters');
        scope.filters = mapFilters(scope.urlFilters);
        scope.output1 = settingsService.getPrimaryOutput();
        scope.output2 = settingsService.getSecondaryOutput();
        scope.page = page;
        scope.componentId = componentId;
        scope.isVariance = isVariance;

        if (scope.output1) {
          initLevels(scope).then(initTotal);
        }
        if (scope.output2) {
          initLevels(scope, true);
        }
      };

      init($scope);
    },
  ]);
