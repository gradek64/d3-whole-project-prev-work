/**
 * Created by Sergiu Ghenciu on 15/01/2018
 */

'use strict';

angular
  .module('pages.outputs', [
    'ngRoute',
    'utils.constants',
    'utils.events',
    'services.outputs-service',
    'services.outputs-types-service',
    'services.financial-years-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/cost-models/:configId/outputs', {
        templateUrl: 'pages/outputs/outputs.html',
        controller: 'OutputCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
        name: 'outputs',
      });
    },
  ])
  .controller('OutputCtrl', [
    '$scope',
    '$routeParams',
    'events',
    'outputsService',
    'outputsTypesService',
    'financialYearsService',
    'CONSTANTS.EVENTS',
    function(
      $scope,
      $routeParams,
      events,
      outputsService,
      outputsTypesService,
      financialYearsService,
      EVENTS
    ) {
      const updateState = () => {
        $scope.errorOrNoData = '';
        $scope.onGetAll($scope.tableState);
      };

      const setBreadcrumbs = (configId) => {
        $scope.breadcrumbs = [
          {
            href: '/#!/cost-models',
            label: 'Cost Models',
          },
          {
            href: '/#!/cost-models/' + configId + '/costpots',
            label: 'Model Config',
          },
          {
            href: '/#!/cost-models/' + configId + '/outputs',
            label: 'Output Management',
          },
        ];
      };

      const create = (form) => {
        if (!form) {
          return;
        }
        // hard-coded for now;
        form.stages = 2;
        $scope.creating = true;

        outputsService
          .create($routeParams.configId, form)
          .then((res) => {
            $scope.tester = true;
            events.emit('OUTPUT_CREATED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.creating = false;
          });
      };

      const deleteOutput = (item) => {
        if (!form) {
          return;
        }

        $scope.deleting = true;
        outputsService
          .delete($routeParams.configId, $scope.focused.id)
          .then((res) => {
            events.emit('OUTPUT_DELETED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const updateOutput = (item) => {
        if (!form) {
          return;
        }
        $scope.updating = true;
        outputsService
          .update($routeParams.configId, $scope.focused.id, {
            status: (item.status === 'PUBLISHED' && 'CREATED') || 'PUBLISHED',
          })
          .then((res) => {
            events.emit('OUTPUT_UPDATED');
            console.log('res', res);
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.updating = false;
          });
      };

      const clearForm = () => {
        [$scope.form1, $scope.form2, $scope.form3].forEach((form) => {
          if (form) {
            form.$setPristine();
          }
          return;
        });
        $scope.formObj = {};
        $scope['resetfinancialYear']();
        $scope['resetOutputType']();
        $scope.error = null;
      };
      /* const statuses = [
        'REQUESTED',
        'PROCESSING',
        'FAILED',
        'COMPLETED',
        'PUBLISHED',
      ];

      let index;
      const getAllStatuses = () => {
        $scope.items.forEach((item) => {
          index = index >= statuses.length - 1 ? 0 : index + 1 || 0;
          return (item.status = statuses[index]);
        });
      };*/

      const expandItemsObject = (item) => {
        const financialYearObj = $scope.financialYears.find(
          (year) => year.id === item.financialYearId
        );

        const outputTypesObj = $scope.outputTypes.find(
          (output) => output.id === item.outputTypeId
        );

        item.financialYearName = financialYearObj.name;
        item.outputTypeName = outputTypesObj.name;

        return item;
      };

      const actions = [
        {label: 'Unpublish', id: 'onUpdate'},
        {label: 'Publish', id: 'onUpdate'},
        {label: 'Inspect', id: 'onInspect'},
        {label: 'Delete', id: 'onDelete'},
      ];
      $scope.getActions = (item) => {
        /* unpublish */
        actions[0].disabled = item.status !== 'PUBLISHED';

        /* publish */
        actions[1].disabled = item.status !== 'CREATED';

        /* delete */
        actions[3].disabled =
          item.status !== 'CREATED' &&
          item.status !== 'FAILED' &&
          item.status !== 'PUBLISHED' &&
          item.status !== 'UNPUBLISHED';

        return actions;
      };

      $scope.callbackFactory = (item) => (action) => {
        if (!$scope[action.id]) {
          console.log('Not implemented');
          return;
        }
        $scope[action.id](item);
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        scope.onSubmit = (form, action) => {
          switch (action) {
            case 'create':
              create(form);
              break;
            case 'delete':
              deleteOutput(form);
              break;
            case 'update':
              updateOutput(form);
              break;
          }
        };

        scope.onDelete = (item) => {
          scope.focused = item;
          events.emit('CONFIRM_DELETE_OUTPUT');
        };

        scope.onUpdate = (item) => {
          scope.focused = item;
          events.emit('CONFIRM_UPDATE_OUTPUT');
        };

        scope.onGetAll = (tableState) => {
          outputsService
            .getAll($routeParams.configId)
            .then((res) => {
              scope.items = res.data.map(expandItemsObject);
              console.log('.....onGetAll end day bug.........', res.data);
              if (scope.items.length === 0) {
                scope.errorOrNoData = 'No Outputs have been created';
              }
            })
            .catch((err) => {
              scope.errorOrNoData = 'There is an error. See console log.';
            })
            .finally(() => {
              scope.isLoading = false;
            });
        };

        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          scope[dropdownName] = fn;
        };
      };

      const bindEvents = () => {
        [
          EVENTS.CLICK_ON_CREATE_OUTPUT,
          EVENTS.CONFIRM_DELETE_OUTPUT,
          EVENTS.CONFIRM_UPDATE_OUTPUT,
        ].forEach((evt) => {
          events.on(evt, clearForm);
        });
      };

      const buildSelectItem = (e) => {
        return {
          label: e.name,
          value: e.id,
        };
      };

      const initFinancialYear = (scope) => {
        financialYearsService.getAll().then((res) => {
          scope.financialYears = res.data;
          scope.financialYearsList = res.data.map(buildSelectItem);
        });
      };

      const initGetStages = (scope) => {
        outputsService.getStages().then((res) => {
          scope.stages = res.data;
        });
      };

      const initOutputTypes = (scope) => {
        outputsTypesService.getAll().then((res) => {
          scope.outputTypes = res.data;
          scope.outputTypesList = res.data.map(buildSelectItem);
        });
      };

      const init = (scope) => {
        scope.formObj = {};
        scope.items = [];
        scope.isLoading = true;

        const configId = $routeParams.configId;
        setBreadcrumbs(configId);

        initFinancialYear(scope);
        initGetStages(scope);
        initOutputTypes(scope);

        augment(scope);
        bindEvents();
      };

      init($scope);
    },
  ]);
