/**
 * Created by Sergiu Ghenciu on 19/12/2017
 */

'use strict';

angular
  .module('pages.cost-models', [
    'ngRoute',
    'utils.constants',
    'utils.events',
    'utils.misc',
    'services.cost-models-service',
    'services.cost-models-mock-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/cost-models', {
        templateUrl: 'pages/cost-models/cost-models.html',
        controller: 'CostModelsCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
        name: 'cost-models',
      });
    },
  ])
  .controller('CostModelsCtrl', [
    '$scope',
    '$location',
    'events',
    'costModelsService',
    'costModelsMockService',
    'misc',
    'CONSTANTS.EVENTS',
    function(
      $scope,
      $location,
      events,
      service,
      costModelsMockService,
      _,
      EVENTS
    ) {
      const updateState = () => {
        // bollocks (remove it in real world)
        if (!$scope.tableState) {
          window.location.reload();
        }
        $scope.onGetAll($scope.tableState);
      };

      const buildSelectItem = (e) => {
        return {
          label: e.name,
          badge: e.type,
          value: {id: e.id, parentId: e.parentConfigurationId, type: e.type},
        };
      };

      const create = (form) => {
        if (!form.title || !form.template) {
          return;
        }
        const doc = {
          parentConfigurationId: form.template.id,
          type: 'USER',
          name: form.title,
        };
        $scope.creating = true;
        service
          .create(doc)
          .then((res) => {
            events.emit('NEW_COST_MODEL_CREATED');
            updateState();
          })
          .catch((err) => {
            console.log('err', err);
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.creating = false;
          });
      };

      const del = (row) => {
        $scope.deleting = true;
        service
          .delete(row.configurationNumber)
          .then((res) => {
            events.emit('COST_MODEL_DELETED');
            updateState();
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const update = (row) => {
        $scope.updating = true;
        service
          .update($scope.focused.id, {name: row.title})
          .then((res) => {
            events.emit('COST_MODEL_UPDATED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.updating = false;
          });
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        /* I would not have these vars outside the getActions function but you
         * get the bloody angular Error: $rootScope:infdig Infinite $digest Loop
         * https://docs.angularjs.org/error/$rootScope/infdig */
        /* DO NOT WORRY TOUGH. I'LL CLEAN THIS UP. I AM THINKING. */
        const actions = [
          {label: 'View Cost Model Config', id: 'onView'},
          {label: 'Edit Cost Model', id: 'onEdit'},
          {label: 'Delete Cost Model', id: 'onDelete'},
        ];

        $scope.getActions = (row) => {
          const isSystem = row.type === 'SYSTEM';
          actions[1].disabled = isSystem;
          actions[2].disabled = isSystem;
          return actions;
        };
        // $scope.getActions = (row) => {
        //  const actions = [{label: 'View Cost Model Config', id: 'onView'}];
        //   if (row.type === 'USER') {
        //     actions.push(
        //         {label: 'Edit Cost Model', id: 'onEdit'},
        //         {label: 'Delete Cost Model', id: 'onDelete'});
        //   }
        //   return actions;
        // };

        $scope.onActionsClick = (row) => (action) => {
          $scope[action.id](row);
        };

        scope.onSubmit = (costModel, action) => {
          switch (action) {
            case 'create':
              create(costModel);
              break;
            case 'delete':
              del(costModel);
              break;
            case 'edit':
              update(costModel);
              break;
          }
        };

        scope.onView = (row) => {
          console.log('onView', row.id);
          $location.path('/cost-models/' + row.id + '/costpots');
        };

        scope.onEdit = (row) => {
          /*
            *@events registered before in a template by events.on([EVENT], fn);
            *@now can be emited below
          */
          events.emit('CONFIRM_UPDATE_COST_MODEL');
          scope.focused = row;
          const parent = scope.allItems.find(
            (e) => e.id === row.parentConfigurationId
          );
          scope.formObj.template2 = parent.name;
          scope.formObj.title = row.name;
        };

        scope.onDelete = (row) => {
          scope.focused = row;
          events.emit('CONFIRM_DELETE_COST_MODEL');
        };

        scope.onGetAll = (tableState) => {
          scope.isLoading = true;
          costModelsMockService.getAll(tableState).then((result) => {
            // service.getAll(tableState).then((result) => {
            scope.items = result.data;
            scope.totalItemCount = result.totalItemCount;
            tableState.pagination.numberOfPages = Math.ceil(
              scope.totalItemCount / scope.itemsByPage
            );
            scope.startIndex = tableState.pagination.start;
            scope.isLoading = false;
            scope.tableState = tableState;
          });
        };

        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          scope[dropdownName] = fn;
        };
      };

      const clearForm = () => {
        [$scope.form1, $scope.form2].forEach((form) => {
          if (form) {
            form.$setPristine();
          }
        });
        $scope.formObj = {};
        $scope['resetTemplate']();
        $scope.error = null;
      };

      const bindEvents = () => {
        console.log(
          'BIND YOUR CUSTOM EVENTS MANUALLY:\n\n events.on(EVENTS.LOGIN_SUCCESS, updateState'
        );
        events.on(EVENTS.LOGIN_SUCCESS, updateState);
        events.on(EVENTS.CLICK_ON_CREATE_COST_MODEL, clearForm);
        events.on(EVENTS.CONFIRM_UPDATE_COST_MODEL, clearForm);

        $scope.$on('$destroy', () => {
          events.off(EVENTS.LOGIN_SUCCESS, updateState);
          events.off(EVENTS.CLICK_ON_CREATE_COST_MODEL, clearForm);
          events.off(EVENTS.CONFIRM_UPDATE_COST_MODEL, clearForm);
        });
      };

      const init = () => {
        $scope.items = [];
        $scope.cm = {};
        $scope.isLoading = true;
        $scope.startIndex = 0;
        $scope.itemsByPage = 6;
        $scope.displayedPages = 10;
        costModelsMockService.getAll().then((res) => {
          // service.getAll().then((res) => {
          const system = res.data
            .filter((e) => e.type === 'SYSTEM')
            .map(buildSelectItem)
            .sort(_.compareFactory('label'));
          const user = res.data
            .filter((e) => e.type === 'USER')
            .map(buildSelectItem)
            .sort(_.compareFactory('label'));

          $scope.templateItems = system.concat(user);
          $scope.allItems = res.data;

          console.log('res...', res);
        });
        augment($scope);
        bindEvents();
      };

      init();
    },
  ]);
