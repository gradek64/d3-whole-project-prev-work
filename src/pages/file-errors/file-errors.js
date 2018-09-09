/**
 * Created by Sergiu Ghenciu on 15/01/2018
 */

'use strict';

angular
  .module('pages.file-errors', [
    'ngRoute',
    'utils.constants',
    'utils.events',
    'services.costpots-service',
    'services.files-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when(
          '/cost-models/:configId/costpots/:costpotId/' +
            'files/:fileId/errors',
          {
            templateUrl: 'pages/file-errors/file-errors.html',
            controller: 'FileViewErrorCtrl',
            data: {
              authorisedRoles: [USER_ROLES.ADMIN],
            },
            name: 'file-errors',
          }
        )
        .when(
          '/cost-models/:configId/costpots/:costpotId/' +
            'sub-costpots/:subCostpotId/' +
            'files/:fileId/errors',
          {
            templateUrl: 'pages/file-errors/file-errors.html',
            controller: 'FileViewErrorCtrl',
            data: {
              authorisedRoles: [USER_ROLES.ADMIN],
            },
            name: 'file-errors',
          }
        );
    },
  ])
  .controller('FileViewErrorCtrl', [
    '$scope',
    '$routeParams',
    'events',
    'costpotsService',
    'filesService',
    function($scope, $routeParams, events, costpotsService, filesService) {
      const updateState = () => {
        $scope.errorOrNoData = '';
        $scope.onGetAll($scope.tableState);
      };

      const setBreadcrumbs = (
        configId,
        costpotId,
        fileId,
        subCostpotId,
        subCostpotName
      ) => {
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
              costpotId +
              '/file-management',
            label: 'File Management',
            skip: subCostpotId,
          },
          {
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpotId +
              '/files/' +
              fileId +
              '/errors',
            label: 'File View Error',
            skip: subCostpotId,
          },
          {
            href: '/#!/cost-models/' + configId + '/costpots/' + costpotId,
            label: subCostpotName,
            skip: !subCostpotId,
          },
          {
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpotId +
              '/sub-costpots/' +
              subCostpotId +
              '/file-management',
            label: 'File Management',
            skip: !subCostpotId,
          },
          {
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpotId +
              '/sub-costpots/' +
              subCostpotId +
              '/files/' +
              fileId +
              '/errors',
            label: 'File View Error',
            skip: !subCostpotId,
          },
        ];

        $scope.breadcrumbs = crumbs.filter((e) => !e.skip);
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        scope.onGetAll = (tableState) => {
          if (!scope.file) {
            return;
          }
          scope.isLoading = true;

          filesService
            .getErrors(scope.file.id, tableState, scope.file.fileTypeId)
            .then((res) => {
              scope.items = res.data;
              if (scope.items.length === 0) {
                scope.errorOrNoData = 'No errors for this file';
              }
            })
            .catch((err) => {
              scope.errorOrNoData = 'There is an error. See console log.';
            })
            .finally(() => {
              scope.isLoading = false;
            });
        };
      };

      const init = (scope) => {
        scope.isLoading = true;

        const configId = $routeParams.configId;
        const costpotId = $routeParams.costpotId;
        const fileId = $routeParams.fileId;

        filesService.getOne(fileId, undefined, configId).then((res) => {
          scope.file = res;
          updateState();
        });

        if ($routeParams.subCostpotId) {
          costpotsService
            .getOne(configId, $routeParams.subCostpotId)
            .then((res) => {
              scope.costpot = res;
              setBreadcrumbs(
                configId,
                costpotId,
                fileId,
                $routeParams.subCostpotId,
                res.name
              );
            });
        } else {
          setBreadcrumbs(configId, costpotId, fileId);
        }

        augment(scope);
      };

      init($scope);
    },
  ]);
