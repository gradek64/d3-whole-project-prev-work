/**
 * Created by Sergiu Ghenciu on 03/01/2018
 */

'use strict';

angular
  .module('pages.sub-costpots', [
    'ngRoute',
    'utils.constants',
    'services.costpots-service',
    'services.files-service',
    'services.file-types-service',
    'utils.misc',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/cost-models/:configId/costpots/:potId', {
        templateUrl: 'pages/sub-costpots/sub-costpots.html', // eslint-disable-line
        controller: 'SubCostpotsCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
      });
    },
  ])
  .controller('SubCostpotsCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    'costpotsService',
    'filesService',
    'fileTypesService',
    'misc',
    'events',
    'CONSTANTS.EVENTS',
    function(
      $scope,
      $routeParams,
      $location,
      service,
      filesService,
      fileTypesService,
      misc,
      events,
      EVENTS
    ) {
      const setBreadcrumbs = (configId, costpot) => {
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
            href: '/#!/cost-models/' + configId + '/costpots/' + costpot.id,
            label: costpot.name,
          },
        ];
      };

      const getParent = (item) =>
        $scope.allItems.find((e) => e.id === item.parentId);

      const getLevel = (item, level = 0) => {
        let parent = getParent(item);
        if (!parent) {
          return level;
        }
        return getLevel(parent, level + 1);
      };

      const create = (item) => {
        if (!item.name) {
          return;
        }
        const doc = {
          name: item.name,
          /* 'classification': $scope.focused.classification, */
          classification: 'INFRASTRUCTURE',
          levelId: $scope.focused.levelId,
          parentId: $scope.focused.id,
          resourceTypeId: $scope.focused.resourceTypeId,
          type: 'USER',
        };

        $scope.creating = true;
        $scope.error = null;
        service
          .create($routeParams.configId, doc)
          .then((res) => {
            $scope.allItems.push(res.data);
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
        $scope.error = null;
        service
          .delete($routeParams.configId, item.id)
          .then((res) => {
            console.log('res', res);
            const index = $scope.allItems.findIndex((e) => e.id === item.id);
            $scope.allItems.splice(index, 1);
            events.emit('SUB_COSTPOT_DELETED');
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const clearForm = () => {
        if ($scope.form1) {
          $scope.form1.$setPristine();
        }
        $scope.formObj = {};
        $scope.error = null;
      };

      const bindEvents = () => {
        events.on(EVENTS.CLICK_ON_CREATE_COSTPOT, clearForm);
        events.on(EVENTS.CONFIRM_DELETE_SUB_COSTPOT, clearForm);
      };

      const hasConfiguredFile = (item) =>
        fileTypesService
          .getAll(item.resourceTypeId)
          .then((res) => res.data)
          .then(filesService.getAll)
          .then((res) => res.data.some((e) => e.status === 'CONFIGURED'));

      const redirectToDatasetFilter = (item) => {
        $location.path(
          '/cost-models/' +
            $routeParams.configId +
            '/costpots/' +
            $routeParams.potId +
            '/sub-costpots/' +
            item.id +
            '/dataset-filters'
        );
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        scope.hasChildren = (item) =>
          scope.allItems.some((e) => e.parentId === item.id);

        scope.callbackFactory = (item) => (action) => {
          scope[action](item);
        };

        scope.onFile = (item) => {
          $location.path(
            '/cost-models/' +
              $routeParams.configId +
              '/costpots/' +
              $routeParams.potId +
              '/sub-costpots/' +
              item.id +
              '/file-management'
          );
        };

        scope.onFilter = (item) => {
          hasConfiguredFile(item).then((has) => {
            if (!has) {
              events.emit('VALIDATE_COSTPOT_FILE');
              return;
            }
            redirectToDatasetFilter(item);
          });
        };

        scope.onCreate = (item) => {
          scope.focused = item;
          scope.focused.level = getLevel(item);
          events.emit('CLICK_ON_CREATE_COSTPOT');
        };

        scope.onDelete = (item) => {
          scope.focused = item;
          scope.focused.level = getLevel(item);
          events.emit('CONFIRM_DELETE_SUB_COSTPOT');
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
      };

      const init = () => {
        $scope.formObj = {};
        $scope.isLoading = true;
        service.getAll($routeParams.configId).then((res) => {
          $scope.allItems = res.data;

          const costpot = res.data.find(
            (e) => e.id === parseInt($routeParams.potId)
          );

          $scope.costpot = costpot;

          setBreadcrumbs($routeParams.configId, costpot);
          $scope.isLoading = false;
          augment($scope);
          bindEvents();
        });
      };

      init();
    },
  ]);
