/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('app', [
    'ngRoute',
    'smart-table',
    'vendors.material-forms',
    'legacy.services.report-service',

    'components.header',
    'components.notifications',
    'components.footer',
    'components.top-nav-map',
    'components.top-nav',
    'components.login-form',
    'components.breadcrumbs',
    'components.costpot',
    'components.costpot-small',
    'components.chart',
    'components.chart-drilldown',
    'components.chart-drilldown-variance',
    'components.chart-drilldown-variance-v2',
    'components.chart-drilldown-scenario',
    // 'components.chart-no-drilldown',
    'components.attributes-toolbar',
    'components.attribute-container',
    'components.filter-toolbar',
    'components.button-group',

    'components.dropdown',
    'components.lp-card',
    'components.reports-menu',
    'components.switch-toggle',
    'components.dropdown-menu',
    'components.dropdown-select',
    'components.dropdown-select-grouped',
    'components.multiple-select',
    'components.modal',
    'components.loading',
    'components.svg-icons',
    'components.output-selection',
    'components.version',

    'pages.home',
    'pages.landing-pages',
    'pages.cost-overview',
    'pages.scenario',
    'pages.scenario-remove',
    'pages.scenario-remove-report',
    'pages.service-statement',
    'pages.kpi',
    'pages.cost-flow',
    'pages.departmental-charges',
    'pages.inter-company-charges',
    'pages.cost-models',
    'pages.costpots',
    'pages.sub-costpots',
    'pages.file-management',
    'pages.dataset-filters',
    'pages.file-errors',
    'pages.outputs',
    'pages.advanced-analysis',
    'pages.users',

    'services.auth-service',
    'services.settings-service',

    'utils.constants',
    'utils.events',
    'utils.filters',
  ])
  .config([
    '$locationProvider',
    '$routeProvider',
    '$rootScopeProvider',
    function($locationProvider, $routeProvider, $rootScopeProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider.otherwise({redirectTo: '/'});

      $rootScopeProvider.digestTtl(9);
    },
  ])
  .run([
    '$rootScope',
    'authService',
    'CONSTANTS.EVENTS',
    'events',
    '$route',
    '$location',
    function($rootScope, authService, EVENTS, events, $route, $location) {
      /* not sure (by now) if this logic should be moved into auth-service */
      const isAuthorised = (roles) => {
        if (roles === undefined) {
          console.warn('Authorised roles are not defined for this route!');
          return true;
        }
        return authService.isAuthorised(roles);
      };

      const checkAuthorisation = (event, data) => {
        if (!authService.isAuthenticated()) {
          event.preventDefault();
          events.emit('NOT_AUTHENTICATED');
          return;
        }

        if (!isAuthorised(data && data.authorisedRoles)) {
          event.preventDefault();
          console.log('NOT_AUTHORISED');
          events.emit('NOT_AUTHORISED');
        }
      };

      const bindEvents = () => {
        $rootScope.$on('$routeChangeStart', (event, next) => {
          // `route not found` use case
          if (next.$$route.redirectTo) {
            return;
          }
          checkAuthorisation(event, next.data);
          $rootScope.name = next.name; // set state className
        });
      };

      const init = () => {
        console.warn('LOGIN_FORM_IS_READY');

        if (
          $route.current.originalPath !== '/' &&
          !isAuthorised(
            $route.current.data && $route.current.data.authorisedRoles
          )
        ) {
          console.log('Not authorized. Redirecting to home page...');
          $location.path('/');
        } else {
          console.log('OK');
          events.off(EVENTS.LOGIN_FORM_IS_READY, init); // un subscribe itself
          checkAuthorisation(
            {preventDefault: angular.noop},
            $route.current.data
          );
          $rootScope.name = $route.current.name; // set state classNam
          bindEvents();
        }
      };

      // init
      events.on(EVENTS.LOGIN_FORM_IS_READY, init);
      Waves.init();
    },
  ])
  .config([
    'stConfig',
    function(stConfig) {
      stConfig.sort.delay = 0;
      stConfig.sort.ascentClass = 'ascending';
      stConfig.sort.descentClass = 'descending';
      stConfig.pipe.delay = 0;
    },
  ])
  .run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put(
        'template/smart-table/pagination.html',
        '<ul ng-if="numPages && pages.length >= 2" class="pagination">' +
          '<li class="waves-effect" ' +
          'ng-class="{disabled: currentPage===1}" ' +
          'ng-click="selectPage(currentPage - 1);' +
          '$event.preventDefault();' +
          '$event.stopPropagation();">' +
          '<a href="#"><i class="material-icons">chevron_left</i></a>' +
          '</li>' +
          '<li ng-repeat="page in pages" ' +
          'ng-class="{active: page==currentPage}" class="waves-effect">' +
          '<a href="#" ng-click="selectPage(page);' +
          '$event.preventDefault();' +
          '$event.stopPropagation();">{{page}}</a>' +
          '</li>' +
          '<li class="waves-effect" ' +
          'ng-class="{disabled: currentPage===numPages}" ' +
          'ng-click="selectPage(currentPage + 1);' +
          '$event.preventDefault();' +
          '$event.stopPropagation();">' +
          '<a href="#"><i class="material-icons">chevron_right</i></a>' +
          '</li>' +
          '</ul>'
      );
    },
  ]);
