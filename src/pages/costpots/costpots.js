/**
 * Created by Sergiu Ghenciu on 28/12/2017
 */

'use strict';

angular
  .module('pages.costpots', [
    'ngRoute',
    'utils.constants',
    'services.costpots-service',
    'services.cost-pots-mock-service',
    'services.cost-models-service',
    'services.cost-models-mock-service',
    'services.levels-service',
    'services.resource-type-service',
    'services.resource-type-mock-service',
    'utils.events',
    'utils.misc',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/cost-models/:id/costpots', {
        templateUrl: 'pages/costpots/costpots.html',
        controller: 'CostpotsCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
        name: 'costpots',
      });
    },
  ])
  .controller('CostpotsCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    'costModelsService',
    'costModelsMockService',
    'costpotsService',
    'costPotsMockService',
    'resourceTypeService',
    'resourceTypeMockService',
    'levelsService',
    'events',
    'CONSTANTS.EVENTS',
    'misc',
    function(
      $scope,
      $routeParams,
      $location,
      costModelsService,
      costModelsMockService,
      costpotsService,
      costPotsMockService,
      resourceTypeService,
      resourceTypeMockService,
      levelsService,
      events,
      EVENTS,
      _
    ) {
      const buildInfrastructureLevelItem = (e) => {
        return {
          label: e.name,
          value: {
            id: e.id,
            classification: 'INFRASTRUCTURE',
            parentId: null,
          },
        };
      };

      const buildResourceTypeItem = (e) => {
        return {
          label: e.label,
          value: {type: e.label, id: e.value.id},
        };
      };

      const create = (costpot) => {
        if (!costpot.title) {
          return;
        }

        $scope.error = null;
        $scope.creating = true;
        const doc = {
          name: costpot.title,
          classification: costpot.level.classification,
          levelId: costpot.level.id,
          parentId: costpot.level.parentId,
          resourceTypeId: costpot.resourceType.id,
          type: 'USER',
        };

        costpotsService
          .create($routeParams.id, doc)
          .then((res) => {
            $scope.allCostpots.push(res.data);
            events.emit('NEW_COSTPOT_CREATED');
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.creating = false;
          });
      };

      const del = (item) => {
        if (!item.id) {
          return;
        }
        $scope.deleting = true;
        costpotsService
          .delete($routeParams.id, item.id)
          .then((res) => {
            const index = $scope.allCostpots.findIndex((e) => e.id === item.id);
            $scope.allCostpots.splice(index, 1);
            events.emit('COSTPOT_DELETED');
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        scope.callbackFactory = () => (item) => {
          scope[item.action](item);
        };

        scope.costpotCallbackFactory = (item) => (action) => {
          if (!scope[action]) {
            return scope.notImplemented();
          }
          scope[action](item);
        };

        scope.onFile = (item) => {
          console.log('on file', item);
          $location.path(
            '/cost-models/' +
              $routeParams.id +
              '/costpots/' +
              item.id +
              '/file-management'
          );
        };

        scope.onView = (item) => {
          $location.path(
            '/cost-models/' + $routeParams.id + '/costpots/' + item.id
          );
        };

        scope.onFilter = (item) => {
          $location.path(
            '/cost-models/' +
              $routeParams.id +
              '/costpots/' +
              item.id +
              '/dataset-filters'
          );
        };

        scope.notImplemented = (item) => {
          console.log('Not implemented');
        };

        scope.onOutputView = (item) => {
          $location.path('/cost-models/' + $routeParams.id + '/outputs');
        };

        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          scope[dropdownName] = fn;
        };

        scope.onSubmit = (item, action) => {
          switch (action) {
            case 'create':
              create(item);
              break;
            case 'delete':
              del(item);
          }
        };

        scope.onCreate = (item) => {
          events.emit('CLICK_ON_CREATE_COSTPOT');
        };

        scope.onDelete = (item) => {
          scope.focused = item;
          events.emit('CONFIRM_DELETE_COSTPOT');
        };

        const iconMap = {
          'General Ledger': 'svgLedger',
          'Contracts': 'svgContracts',
          'Labour': 'svgLabour',
          'Other': 'svgRecoveries',
          'IT Functional Breakdown': 'svgResourceStack',
          'IT Services': 'svgService',
          'Organisation Capabilities': 'svgCapabilities',
        };

        scope.getSvgIcon = (item, level) => {
          if (level.domainId === 3) {
            return 'svgInfrastructure';
          }
          return iconMap[item.name];
        };
      };

      const clearForm = () => {
        if ($scope.form1) {
          $scope.form1.$setPristine();
        }
        $scope.formObj = {};
        $scope.error = null;
        // reset Dropdown = names from html template methods;
        $scope['resetLevel']();
        $scope['resetResourceType']();
      };

      const bindEvents = () => {
        events.on(EVENTS.CLICK_ON_CREATE_COSTPOT, clearForm);
        events.on(EVENTS.CONFIRM_DELETE_COSTPOT, clearForm);
      };

      const init = (scope) => {
        scope.configId = $routeParams.id;
        $scope.formObj = {};
        resourceTypeMockService.getAll($routeParams.id).then((res) => {
          scope.resourceTypeItems = res.data.map(buildResourceTypeItem);
        });
        levelsService.getAll($routeParams.id).then((res) => {
          scope.allLevels = res.data.sort(
            _.compareFactory('order', false, true)
          );
          scope.infrastructureLevels = res.data
            .filter((e) => e.domainId === 3)
            .map(buildInfrastructureLevelItem);
        });

        // costpotsService.getAll($routeParams.id).then((res) => {
        costPotsMockService.getAll($routeParams.id).then((res) => {
          scope.allCostpots = res.data;
        });

        costModelsMockService.getOne($routeParams.id).then((res) => {
          $scope.configuration = res;
        });

        augment(scope);
        bindEvents();
      };

      init($scope);
    },
  ]);
