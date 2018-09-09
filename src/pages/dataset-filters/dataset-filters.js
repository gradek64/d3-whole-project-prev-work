/**
 * Created by Sergiu Ghenciu on 24/01/2018
 */

'use strict';

angular
  .module('pages.dataset-filters', [
    'ngRoute',
    'utils.constants',
    'utils.events',
    'utils.misc',
    'services.files-mock-service',
    'services.files-service',
    'services.file-types-service',
    'services.file-types-mock-service',
    'services.cost-pots-mock-service',
    'services.costpots-service',
    'services.filters-service',
    'services.filters-mock-service',
    'services.filters-settings-service',
    'services.file-mappings-service',
    'services.file-mappings-mock-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/cost-models/:configId/costpots/:costpotId/dataset-filters', {
          templateUrl: 'pages/dataset-filters/dataset-filters.html',
          controller: 'DatasetFiltersCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ADMIN],
          },
          name: 'dataset-filters',
        })
        .when(
          '/cost-models/:configId/costpots/:costpotId/' +
            'sub-costpots/:subCostpotId/dataset-filters',
          {
            templateUrl: 'pages/dataset-filters/dataset-filters.html',
            controller: 'DatasetFiltersCtrl',
            data: {
              authorisedRoles: [USER_ROLES.ADMIN],
            },
            name: 'dataset-filters',
          }
        );
    },
  ])
  .controller('DatasetFiltersCtrl', [
    '$scope',
    '$routeParams',
    'events',
    'filesService',
    'filesMockService',
    'fileTypesService',
    'fileTypesMockService',
    'costpotsService',
    'costPotsMockService',
    'filtersService',
    'filtersMockService',
    'fileMappingsService',
    'fileMappingsMockService',
    'filtersSettingsService',
    'misc',
    'CONSTANTS.EVENTS',
    function(
      $scope,
      $routeParams,
      events,
      filesService,
      filesMockService,
      fileTypesService,
      fileTypesMockService,
      costpotsService,
      costPotsMockService,
      filtersService,
      filtersMockService,
      fileMappingsService,
      fileMappingsMockService,
      filtersSettingsService,
      _,
      EVENTS
    ) {
      // const execFn = (fn) => {
      //   fn();
      // };
      const resetMap = {};

      const updateState = () => {
        $scope.errorOrNoData = '';
        $scope.onGetAll($scope.tableState);
      };

      const setBreadcrumbs = (configId, costpot, subCostpotId) => {
        const crumbs = [
          {
            href: '/#!/cost-models',
            label: 'Cost Models',
          },
          {
            href: '/#!/cost-models/' + configId + '/costpots',
            label: 'Model Config',
          },
          {
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpot.id +
              '/dataset-filters',
            label: 'Dataset Filters',
            skip: subCostpotId,
          },
          {
            href: '/#!/cost-models/' + configId + '/costpots/' + costpot.id,
            label: costpot.name,
            skip: !subCostpotId,
          },
          {
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpot.id +
              '/sub-costpots/' +
              subCostpotId +
              '/dataset-filters',
            label: 'Dataset Filters',
            skip: !subCostpotId,
          },
        ];

        $scope.breadcrumbs = crumbs.filter((e) => !e.skip);
      };

      const buildTargetItems = (e) => {
        return {
          label: e.name,
          value: {id: e.id, resourceTypeId: e.resourceTypeId},
          id: 'onTargetChange',
        };
      };

      const del = (item) => {
        $scope.deleting = true;
        filtersService
          .delete(item.configurationId, item.id)
          .then((res) => {
            const index = $scope.items.findIndex((e) => e.id === item.id);
            $scope.items.splice(index, 1);
            events.emit('DATASET_FILTER_DELETED');
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const buildCdmItems = (e) => {
        return {
          label: e.name,
          value: {id: e.id, name: e.name},
        };
      };

      const resetDropdown = (name, items = []) => {
        if (!resetMap[name]) {
          return;
        }
        resetMap[name].forEach((fn, i) => {
          fn(items[i]);
        });
      };

      const resetValues = (formFilters, filters) => {
        formFilters.forEach((e, i) => {
          e.value = null;
        });

        filters.map((e) => e.value).forEach((value, i) => {
          if (!formFilters[i]) {
            formFilters[i] = {};
          }
          formFilters[i].value = value;
        });
      };

      const resetSourceSection = (filters = []) => {
        const columns = filters.map((filter) =>
          $scope.sourceCdmItems.find((e) => e.value.id == filter.column)
        );
        const operands = filters.map((filter) =>
          $scope.operandItems.find((e) => e.value === filter.condition)
        );

        resetDropdown('sourceColumn', columns);
        resetDropdown('sourceColumnMatch', columns);
        resetDropdown('sourceOperand', operands);
        resetDropdown('sourceOperandMatch', operands);
        resetValues($scope.formObj.settings[0].filters, filters);
      };

      const resetTargetSection = (filters = []) => {
        const columns = filters.map((filter) =>
          $scope.targetCdmItems.find((e) => e.value.id == filter.column)
        );
        const operands = filters.map((filter) =>
          $scope.operandItems.find((e) => e.value === filter.condition)
        );

        resetDropdown('targetColumn', columns);
        resetDropdown('targetOperand', operands);
        resetValues($scope.formObj.settings[1].filters, filters);
      };

      const clearForm = () => {
        // console.log('clearing the form...', $scope.form1);
        if ($scope.form1) {
          // console.log('setting pristine...');
          $scope.form1.$setPristine();
        }
        $scope.formObj = {};
        $scope.formObj.section = 'none';
        $scope.formObj.settings = [{filters: []}, {filters: []}];
        $scope.error = null;

        resetDropdown('resetTarget');
        resetDropdown('distribution');
        resetDropdown('resetMatch');
        resetDropdown('distributionColumn');

        resetSourceSection();
        resetTargetSection();
      };

      const buildRatiofiles = (e) => {
        return {
          label: e.fileName,
          value: {fileId: e.id},
        };
      };
      // prettier-ignore
      const getRatioFiles = (costpot) => {
        fileTypesMockService
          .getAll(costpot.resourceTypeId)
          .then(
            (res) => res.data.filter((fileType) => fileType.code === 'RATIO'))
          .then((ratioTypes) =>
            filesMockService.getAll(ratioTypes).then((res) => res.data)
          )
          .then((files) =>
            files.filter((e) => e.active && e.status === 'CONFIGURED')
          )
          .then((files) => {
            $scope.ratioItems = files.map(buildRatiofiles);

            console.log('$scope.ratioItems', $scope.ratioItems);
          });
      };

      const getAllFiles = (costpot) =>
        fileTypesService
          .getAll(costpot.resourceTypeId)
          .then((res) => res.data)
          .then(filesService.getAll);

      const hasConfiguredFile = (costpot) =>
        getAllFiles(costpot).then((res) =>
          res.data.some((e) => e.status === 'CONFIGURED')
        );

      const hasChildren = (costpot) =>
        $scope.allCostpots.some((e) => e.parentId === costpot.id);

      const mapForm = (form) => {
        // hardcoded as suggested by the backend team
        const someRequired = {
          enabled: true,
          percentage: 100,
          routeServiceCosts: true,
        };

        // doc
        const doc = {
          type: 'USER',
          name: form.name,
          distribution: form.distribution,
          targetCostpotId: form.target.id,
          filterType: form.section,
          settings: form.settings,
        };

        if (form.distributionColumn) {
          doc.distributionColumn = form.distributionColumn.name;
        } else {
          doc.distributionColumn = 'N/A';
        }

        // settings
        const source = form.settings[0];
        const target = form.settings[1];

        source.classification = 'SOURCE';
        source.costPotId = $scope.costpot.id;
        source.matchedColumns =
          form.section === 'match' ? form.match.name : null;

        target.classification = 'TARGET';
        target.costPotId = form.target.id;
        target.matchedColumns =
          form.section === 'match' ? form.match.name : null;

        if (form.section !== 'filter' && form.section !== 'match') {
          source.filters = [];
          target.filters = [];
        }

        if (form.section === 'filter') {
          if (form.noSource) {
            source.filters = [];
          } else {
            source.filters = source.filters.filter(filterIsValid).map((e) => {
              e.column = e.column.id;
              return e;
            });
          }
          if (form.noTarget) {
            target.filters = [];
          } else {
            target.filters = target.filters.filter(filterIsValid).map((e) => {
              e.column = e.column.id;
              return e;
            });
          }
        }

        if (form.section === 'match') {
          if (form.noFilterMatch) {
            source.filters = [];
          } else {
            source.filters = source.filters.filter(filterIsValid).map((e) => {
              e.column = e.column.id;
              return e;
            });
          }
          target.filters = [];
        }

        if (form.section == 'ratio') {
          doc.distribution = 'RATIO';
          doc.distributionColumn = form.distributionColumnRatio.fileId;
        }

        return Object.assign(doc, someRequired);
      };

      const filterIsValid = (filter) =>
        ['column', 'condition', 'value'].every((e) => filter[e]);

      const anyIsValid = (filters) => filters.some(filterIsValid);

      const isValid = (form) => {
        if (
          !form ||
          !form.target ||
          (form.section === 'filter' &&
            !form.noSource &&
            !anyIsValid(form.settings[0].filters)) ||
          (form.section === 'filter' &&
            !form.noTarget &&
            !anyIsValid(form.settings[1].filters)) ||
          ((form.section === 'match' && !form.match) ||
            (form.section === 'match' &&
              !form.noFilterMatch &&
              !anyIsValid(form.settings[0].filters))) ||
          (form.section === 'ratio' && !form.distributionColumnRatio) ||
          (form.section !== 'ratio' && !form.distribution)
        ) {
          return false;
        }
        return true;
      };

      const create = (form) => {
        // console.log(form);
        // console.log(mapForm(form));
        // return;
        if (!isValid(form)) {
          console.log('INVALID FORM');
          return;
        }

        $scope.creating = true;
        $scope.error = null;
        /* the fourth parameter is an ITFB exception */
        filtersService
          .create(
            $routeParams.configId,
            mapForm(form),
            $scope.costpot.name === 'IT Functional Breakdown'
          )
          .then((res) => {
            // console.log('create', res);
            events.emit('FILTER_CREATED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.creating = false;
          });
      };

      const getSection = (filter, source, target) => {
        // if (source.conditions.length || target.conditions.length) {
        //   return 'filter';
        // }
        //
        // return 'none';
        return filter.filterType;
      };

      const reconstructForm = (filter, settings) => {
        const source = settings.find((e) => e.classification === 'SOURCE');

        const target = settings.find((e) => e.classification === 'TARGET');

        const section = getSection(filter, source, target);

        $scope.formObj.name = filter.name;
        $scope.formObj.section = section;
        $scope.formObj.noSource = !source.conditions.length;
        $scope.formObj.noFilterMatch = !source.conditions.length;
        $scope.formObj.noTarget = !target.conditions.length;

        // prettier-ignore
        let selected = $scope.allCostpots.find(
            (e) => e.id === target.costPotId);
        resetDropdown('resetTarget', [buildTargetItems(selected)]);

        selected = $scope.distributionItems.find(
          (e) => e.value === filter.distribution
        );
        resetDropdown('distribution', [selected]);

        resetDropdown('distributionColumn', [
          {label: filter.distributionColumn},
        ]);

        if (section === 'ratio') {
          const ratioFile = $scope.ratioItems.find(
            (e) => e.value.fileId === parseInt(filter.distributionColumn)
          );
          resetDropdown('distributionColumnRatio', [
            {label: ratioFile.label},
          ]);
        }

        if (section === 'match') {
          resetDropdown('resetMatch', [{label: source.matchedColumns}]);
          resetSourceSection(source.conditions);
        } else {
          resetSourceSection(source.conditions);
          resetTargetSection(target.conditions);
        }
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        const actions = [
          {label: 'View Dataset Filter', id: 'onView'},
          {label: 'Delete Dataset Filter', id: 'onDelete'},
        ];

        scope.getActions = (item) => {
          return actions;
        };

        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          if (!resetMap[dropdownName]) {
            resetMap[dropdownName] = [];
          }
          resetMap[dropdownName].push(fn);
        };

        scope.callbackFactory = (item) => (action) => {
          if (!scope[action.id]) {
            console.log('Not implemented');
            return;
          }
          scope[action.id](item || action.value);
        };

        scope.onTargetChange = (item) => {
          scope.error = null;
          resetTargetSection();
          hasConfiguredFile(item).then((has) => {
            if (!has) {
              scope.error = 'There are no Active files in this CostPot';
              scope.formObj.target = null;
              scope.targetCdmItems = [];
            } else {
              initCdmItems(scope, scope.formObj.target, 'targetCdmItems');
            }
          });
        };

        scope.onDelete = (row) => {
          console.log(row);
          scope.focused = row;
          events.emit('CONFIRM_DELETE_DATASET_FILTER');
        };

        scope.onView = (item) => {
          console.log(item);
          scope.action = 'view';

          events.emit('CLICK_ON_CREATE_FILTER');
          scope.creating = true;
          filtersSettingsService
            .getAll(item.id)
            .then((res) => {
              console.log('res', res);
              reconstructForm(item, res.data);
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              scope.creating = false;
            });

          // scope.formObj.name = item.name;
        };

        scope.onCreate = (item) => {
          scope.action = 'create';
          events.emit('CLICK_ON_CREATE_FILTER');

          initCdmItems(scope, scope.costpot, 'sourceCdmItems');
        };

        scope.onSubmit = (form, action) => {
          switch (action) {
            case 'create':
              create(form);
              break;
            case 'delete':
              del(form);
              break;
          }
        };

        scope.findCostpot = (id) => scope.allCostpots.find((e) => e.id === id);

        /* the fourth parameter is an ITFB exception */
        scope.onGetAll = (tableState) => {
          scope.isLoading = true;
          $scope.errorOrNoData = '';

          console.log('/////on get all', scope.costpot);
          if (!scope.costpot) {
            return;
          }
          // filtersService
          filtersMockService
            .getAll(
              $routeParams.configId,
              scope.costpot.id,
              tableState,
              scope.costpot.name === 'IT Functional Breakdown'
            )
            .then((res) => {
              console.log('....res...dataset-filters', res);
              scope.items = res.data;
              if (scope.items.length === 0) {
                scope.errorOrNoData = 'No Dataset Filters Available';
              }
            })
            .catch((err) => {
              scope.errorOrNoData =
                err.status === -1
                  ? 'REQUEST CANCELED (check timeout settings)'
                  : 'There is an error. See console log.';
              console.log(err);
            })
            .finally(() => {
              scope.isLoading = false;
            });
        };
      };

      const bindEvents = (scope) => {
        events.on(EVENTS.CLICK_ON_CREATE_FILTER, clearForm);

        scope.$on('$destroy', () => {
          events.off(EVENTS.CLICK_ON_CREATE_FILTER, clearForm);
        });
      };

      const initTargetItems = (scope) => {
        const highestLevel = scope.allCostpots
          .map((e) => e.levelId)
          .reduce((a, b) => Math.max(a, b));

        scope.targetItems = scope.allCostpots
          .filter((e) => !hasChildren(e))
          .filter((e) => e.levelId > scope.costpot.levelId)
          .filter((e) => e.levelId < highestLevel)
          .map(buildTargetItems);
      };

      const initCdmItems = (scope, costpot, name) =>
        getAllFiles(costpot)
          .then((res) =>
            res.data.find((e) => e.active && e.status === 'CONFIGURED')
          )
          .then((activeFile) => {
            fileMappingsService.getAll(activeFile.fileTypeId).then((res) => {
              scope[name] = res.data
                .map(buildCdmItems)
                .sort(_.compareFactory('label'));
            });
          });

      const initMatchByItems = (scope) => {
        // fileMappingsService.getAll('common').then((res) => {
        fileMappingsMockService.getAll('common').then((res) => {
          console.log('file file-mappings-service', res.data);
          scope.matchByItems = res.data
            .map(buildCdmItems)
            .sort(_.compareFactory('label'));
        });
      };

      const init = (scope) => {
        clearForm(); // clear = init
        scope.distributionItems = [
          {label: 'Even', value: 'EVEN'},
          {label: 'Ratio', value: 'RATIO'},
        ];
        scope.operandItems = [{label: 'Equals', value: 'EQUALS'}];
        scope.sourceCdmItems = [];
        scope.targetCdmItems = [];

        const configId = $routeParams.configId;
        const costpotId = $routeParams.subCostpotId || $routeParams.costpotId;

        setBreadcrumbs(
          configId,
          {id: $routeParams.costpotId, name: 'Loading...'},
          $routeParams.subCostpotId
        );

        initMatchByItems(scope);
        // costpotsService.getAll(configId).then((res) => {
        costPotsMockService.getAll(configId, costpotId).then((res) => {
          scope.allCostpots = res.data;

          console.log('cope.allCostpots dataset-filters', scope.allCostpots);

          scope.costpot = scope.allCostpots.find(
            // (e) => e.id === parseInt(542)
            /* for mock test agains name never in production*/
            (e) => e.name === 'IT Functional Breakdown'
          );
          updateState();

          scope.genLegCostPot = scope.allCostpots.find(
            (e) => e.name === 'General Ledger'
          );

          getRatioFiles(scope.genLegCostPot);

          setBreadcrumbs(
            configId,
            {
              id: $routeParams.costpotId,
              name: scope.costpot.name,
            },
            $routeParams.subCostpotId
          );
          console.log('scope dataset-filters', scope);
          // initTargetItems(scope);

          return;
          initCdmItems(
            scope,
            scope.costpot,
            'sourceCdmItems',
            scope.costpot.name === 'IT Functional Breakdown'
          );

          // setTimeout(scope.$digest);
        });

        augment(scope);
        bindEvents(scope);
      };

      init($scope);
    },
  ]);
