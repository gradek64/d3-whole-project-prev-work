/**
 * Created by Sergiu Ghenciu on 20/02/2018
 */

'use strict';

angular
  .module('pages.advanced-analysis', [
    'ngRoute',
    'utils.misc',
    'utils.constants',
    'utils.events',
    'services.levels-service',
    'services.costs-service',
    'services.file-mappings-service',
    'services.settings-service',
    'utils.chart-data-format',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/power-mode', {
        templateUrl: 'pages/advanced-analysis/advanced-analysis.html',
        controller: 'AdvancedAnalysisCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
        name: 'advanced-analysis',
      });
    },
  ])
  .controller('AdvancedAnalysisCtrl', [
    'misc',
    '$scope',
    '$routeParams',
    'events',
    'CONSTANTS.EVENTS',
    'levelsService',
    'costsService',
    'fileMappingsService',
    'settingsService',
    'chartDataFormat',
    function(
      _,
      $scope,
      $routeParams,
      events,
      EVENTS,
      levelsService,
      costsService,
      fileMappingsService,
      settingsService,
      cdf
    ) {
      const resetMap = {};
      const render = (scope, data, accessor, opts) => {
        scope.r3(data, accessor, opts);
      };

      // eslint-disable-next-line
      const resetDropdown = (name, selected = []) => {
        if (!resetMap[name]) {
          return;
        }
        resetMap[name].forEach((fn, i) => {
          fn(selected[i]);
        });
      };
      /*
      const setBreadcrumbs = (configId) => {
        const crumbs = [
          {
            href: '/#!/cost-models',
            label: 'Cost Models',
          },
          {
            href: '/#!/cost-models/' + configId + '/advanced-analysis',
            label: 'Advanced Analysis',
          },
        ];
        $scope.breadcrumbs = crumbs.filter((e) => !e.skip);
      };
*/

      const collectGroupBys = (form) => {
        // return [
        //   {resource: 'SOURCE_LEGAL_ENTITY', mapping: 'name'},
        //   {resource: 'SOURCE_COST_CENTRE', mapping: 'id'},
        // ];
        return form.filters
          .map((e) => e.groupBy)
          .filter((e) => e !== null)
          .reduce((a, e) => {
            a.push({value: e.name});
            return a;
          }, []);
      };

      const collectFilters = (form) => {
        // return [];
        // return [
        //   {resource: 'COST_CATEGORY', column: 'name', value: 'Non-Staff'},
        // ];
        return form.filters
          .filter((e) => e.filter !== null && e.value)
          .reduce((a, e) => {
            a.push({name: e.filter.name, value: e.value});
            return a;
          }, []);
      };

      const getAccessor = (groupBys, labelIndex = 0) => {
        const accessor = groupBys.reduce((a, e, i) => {
          // const key = labelIndex === i ? 'label' : e.name;
          const key = e.value;
          a[key] = key;
          return a;
        }, {});

        accessor.value = 'amount';
        accessor.id = 'id';
        return accessor;
      };

      const headerMap = {
        Amount: 'currency',
        Percentage: 'percentage',
      };

      const definition = (header) =>
        header.map((e) => (headerMap[e] ? headerMap[e] : 'string'));

      const computeTotal = (data, accessor) =>
        data.reduce((a, e) => a + e[accessor], 0);

      const augment = (scope) => {
        scope.onAddFilter = () => {
          scope.formObj.filters.push(buildFilter());
        };

        scope.onRemoveFilter = ($index) => {
          scope.formObj.filters.splice($index, 1);
          scope.onSubmit(scope.formObj);
        };

        scope.onSubmit = (form) => {
          // console.log('form', form);
          // return;
          if (!form.level) {
            return;
          }

          const groupBys = collectGroupBys(form);
          const filters = collectFilters(form);
          // console.log('groupBys', groupBys);
          // console.log('filters', filters);
          // return;

          const params = {
            groupBy: groupBys,
            filters: filters,
          };

          scope.opts.isLoading = true;
          costsService
            .getAll(scope.output.instanceId, form.level.id, params)
            .then((res) => {
              console.log('res', res, params);

              if (!res.data || !res.data[0]) {
                return render(scope, res.data, null, scope.opts);
              }

              const accessor = getAccessor(groupBys);

              const total = computeTotal(res.data, 'amount');

              // console.log('groupBys', groupBys);
              // console.log('accessor', getAccessor(groupBys));

              // const headings = params.groupBy.map((e) => e.name);
              const headings = _.values(_.dissoc('id', accessor));

              scope.opts.header = headings.map(_.ucFirst);
              scope.opts.definition = definition(scope.opts.header);

              scope.opts.footer = _.repeat(_.length(scope.opts.header), '');
              scope.opts.footer[0] = 'Total';
              scope.opts.footer[
                _.length(scope.opts.footer) - 1
              ] = cdf.formatCurrency(total, total < 0, '£');

              scope.data = res.data;
              scope.accessor = _.copyObj(accessor);

              render(scope, res.data, accessor, scope.opts);
            })
            .finally(() => {
              scope.opts.isLoading = false;
            });
        };

        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          if (!resetMap[dropdownName]) {
            resetMap[dropdownName] = [];
          }
          resetMap[dropdownName].push(fn);
        };

        scope.renderFactory = (id) => (fn) => {
          scope.r3 = fn;
        };

        scope.onChangeType = (type) => {
          console.log('type', type);
          console.log('scope.data', scope.data);
          console.log('scope.accessor', scope.accessor);
          scope.opts.type = type.value;
          render(scope, scope.data, scope.accessor, scope.opts);
        };
      };

      const bindEvents = (scope) => {
        const onOutputChange = (output) => {
          scope.output = output;
          if (output) {
            initLevelItems(scope, output.instanceId);
            initGroupByItems(scope, output);
          }
          resetDropdown('level');
        };
        events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
        scope.$on('$destroy', () => {
          events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
        });
      };

      const buildFilter = () => {
        return {};
      };

      const initFilters = (scope) => {
        if (!scope.formObj) {
          scope.formObj = {};
        }
        scope.formObj.filters = [buildFilter()];
      };

      const buildLevelItem = (e) => {
        return {
          label: e.name,
          value: e,
        };
      };

      const initLevelItems = (scope, configUuid) => {
        levelsService.getAll(configUuid, undefined, 'model-srv').then((res) => {
          console.log('level', res);
          scope.levelItems = res.data
            .sort(_.compareFactory('order', false, true))
            .map(buildLevelItem);
        });
      };

      const initGroupByItems = (scope, configId) => {
        // groupByItems are made up from `common CDM mapping attributes`
        fileMappingsService.getAll('common').then((res) => {
          console.log('mapping', res);
          scope.groupByItems = res.data
            .map((e, i) => {
              return {label: e.name, value: e};
            })
            .sort(_.compareFactory('label'));
        });
      };

      const init = (scope) => {
        augment(scope);
        initFilters(scope);
        bindEvents(scope);
        scope.opts = {
          isLoading: false,
          disableFilters: false,
          title: 'Table Output',
          totalAmount: 3,
          type: 'table',
          types: [
            {label: 'Table', value: 'table', selected: true},
            {label: 'Sankey', value: 'sankey'},
          ],
        };
        scope.data = [];
        scope.accessor = {};

        scope.output = settingsService.getPrimaryOutput();
        console.log('output', scope.output);
        if (scope.output) {
          // setBreadcrumbs($routeParams.configId);
          initLevelItems(scope, scope.output.instanceId);
          initGroupByItems(scope, scope.output);
        }
      };

      init($scope);
    },
  ]);
