/**
 * Created by Sergiu Ghenciu on 15/01/2018
 */

'use strict';

angular
  .module('pages.file-management', [
    'ngRoute',
    'utils.constants',
    'utils.events',
    'services.costpots-service',
    'services.cost-pots-mock-service',
    'services.files-service',
    'services.files-mock-service',
    'services.file-types-service',
    'services.file-types-mock-service',
    'services.file-mappings-service',
    'services.file-mappings-mock-service',
    'services.file-columns-service',
    'services.file-columns-mock-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider
        .when('/cost-models/:configId/costpots/:costpotId/file-management', {
          templateUrl: 'pages/file-management/file-management.html',
          controller: 'FileManagementCtrl',
          data: {
            authorisedRoles: [USER_ROLES.ADMIN],
          },
          name: 'file-management',
        })
        .when(
          '/cost-models/:configId/costpots/:costpotId/' +
            'sub-costpots/:subCostpotId/file-management',
          {
            templateUrl: 'pages/file-management/file-management.html',
            controller: 'FileManagementCtrl',
            data: {
              authorisedRoles: [USER_ROLES.ADMIN],
            },
            name: 'file-management',
          }
        );
    },
  ])
  .controller('FileManagementCtrl', [
    '$scope',
    '$routeParams',
    'events',
    'costpotsService',
    'costPotsMockService',
    'filesService',
    'filesMockService',
    'fileTypesService',
    'fileTypesMockService',
    'fileMappingsService',
    'fileMappingsMockService',
    '$location',
    'fileColumnsService',
    'fileColumnsMockService',
    'CONSTANTS.EVENTS',
    '$q',
    function(
      $scope,
      $routeParams,
      events,
      costpotsService,
      costPotsMockService,
      filesService,
      filesMockService,
      fileTypesService,
      fileTypesMockService,
      fileMappingsService,
      fileMappingsMockService,
      $location,
      fileColumnsService,
      fileColumnsMockService,
      EVENTS,
      $q
    ) {
      const updateState = () => {
        $scope.errorOrNoData = '';
        $scope.onGetAll($scope.tableState);
      };

      const setBreadcrumbs = (configId, costpot, subCostpotId) => {
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
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpot.id +
              '/file-management',
            label: 'File Management',
          },
        ];

        if (subCostpotId) {
          $scope.breadcrumbs[2] = {
            href: '/#!/cost-models/' + configId + '/costpots/' + costpot.id,
            label: costpot.name,
          };
          $scope.breadcrumbs.push({
            href:
              '/#!/cost-models/' +
              configId +
              '/costpots/' +
              costpot.id +
              '/sub-costpots/' +
              subCostpotId +
              '/file-management',
            label: 'File Management',
          });
        }
      };

      const clearForm = () => {
        [$scope.form1, $scope.form2, $scope.form3].forEach((form) => {
          if (form) {
            form.$setPristine();
          }
        });
        $scope.formObj = {};
        $scope.formObj1 = {};
        $scope.formObj3 = {};
        $scope['resetTemplate']();
        $scope.error = null;
      };

      const setActive = (item) => {
        $scope.updating = true;
        filesService
          .update(item.fileTypeId, item.id, {active: true})
          .then((res) => {
            events.emit('FILE_UPDATED');
            if (res.data.active === item.active) {
              return;
            }
            $scope.items
              .filter((e) => e.fileTypeId === item.fileTypeId)
              .forEach((e) => {
                e.active = e.id === item.id;
              });
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            $scope.updating = false;
          });
      };

      const deleteFile = (item) => {
        $scope.deleting = true;
        filesService
          .delete(item.fileTypeId, item.id)
          .then((res) => {
            const index = $scope.items.findIndex((e) => e.id === item.id);
            $scope.items.splice(index, 1);
            events.emit('FILE_DELETED');
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const buildFileTypeItem = (e) => {
        return {
          label: e.name,
          value: {id: e.id},
        };
      };

      const buildFileField = (e) => {
        return {
          label: e.columnName,
          resourceTypeMappingId: e.resourceTypeMappingId,
          value: {id: e.id},
        };
      };

      const upload = (form) => {
        console.log(form);
        if (!form.fileType || !form.files) {
          return;
        }

        // const fileType = $scope.fileTypes.find(
        //     (e) => e.id === form.fileType.id);
        //
        // const guessed = {
        //   fileTypeName: fileType.name,
        //   fileName: form.files[0].name,
        //   status: 'UPLOADING',
        //   active: false,
        //   sourceType: 'CSV',
        //   createdBy: 'current user',
        //   creationDate: new Date(),
        // };
        //
        // $scope.items.push(guessed);
        // events.emit('FILE_UPLOADED');

        $scope.uploading = true;
        filesService
          .upload(form.fileType.id, form.files, $scope.costpot.id)
          .then((res) => {
            console.log('upload', res);
            events.emit('FILE_UPLOADED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.uploading = false;
          });
      };
      const isRowValid = (isMandatory, field) => {
        if (isMandatory && !field) {
          return false;
        }
        return true;
      };

      const isValid = (form) =>
        Object.keys(form).every((e, index) => {
          return isRowValid($scope.cdmItems[e].mandatory, form[e]);
        });

      const mapping = (form) => {
        console.log('form', form);
        if (!isValid(form)) {
          return;
        }

        const fields = Object.keys(form)
          .filter((e) => form[e] !== null)
          .reduce((a, e) => {
            a.push({
              id: form[e].id,
              resourceTypeMappingId: $scope.cdmItems[e].id,
            });
            return a;
          }, []);

        if (fields.length === 0) {
          return;
        }

        const doc = {fileColumnList: fields};

        $scope.mapping = true;
        $scope.error = null;
        fileColumnsService
          .update($scope.focused.id, doc)
          .then((res) => {
            events.emit('FILE_UPDATED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.mapping = false;
          });
      };

      const isRowValidRatio = (isMandatory, field, reference) => {
        if (isMandatory && !field) {
          return false;
        }
        if (isMandatory && field && !reference) {
          return false;
        }
        if (field && !reference) {
          return false;
        }

        return true;
      };

      const isValidRatio = (form) =>
        Object.keys(form.mapping).every((e, index) =>
          isRowValidRatio(
            $scope.cdmItems[e].mandatory,
            form.mapping[e],
            form.fileRatio[e]
          )
        );

      const mappingRatio = (form) => {
        if (!isValidRatio(form)) {
          return;
        }

        const ratioFields = Object.keys(form.fileRatio).reduce((a, e) => {
          console.log(form.fileRatio[e]);
          if (form.fileRatio[e] !== null) {
            a.push(form.fileRatio[e]);
          }
          return a;
        }, []);

        let fields = Object.keys(form.mapping)
          .filter((e) => form.mapping[e] !== null)
          .reduce((a, e, i) => {
            console.log('e', e);
            a.push({
              id: form.mapping[e].id,
              resourceTypeMappingId: $scope.cdmItems[e].id,
              resource: ratioFields[i],
            });
            return a;
          }, []);

        const doc = {fileColumnList: fields};

        $scope.mapping = true;
        $scope.error = null;
        fileColumnsService
          .update($scope.focused.id, doc)
          .then((res) => {
            events.emit('FILE_UPDATED');
            updateState();
          })
          .catch((err) => {
            $scope.error = err.data.description;
          })
          .finally(() => {
            $scope.mapping = false;
          });
      };

      // now we have fileTypeName on items;
      const isRatioType = (file) => file.fileTypeName === 'Ratio File';

      const augment = (scope) => {
        scope.emit = events.emit;

        const actions = [
          {label: 'Download File', id: 'onDownload'},
          {label: 'CDM Mapping', id: 'onMapping'},
          {label: 'Set Active', id: 'onSetActive'},
          {label: 'View Error', id: 'onViewError'},
          {label: 'Delete File', id: 'onDelete'},
        ];
        scope.getActions = (item) => {
          const notUploadedOrConfigured =
            item.status !== 'UPLOADED' && item.status !== 'CONFIGURED';

          actions[0].disabled = notUploadedOrConfigured;
          actions[1].disabled = notUploadedOrConfigured;
          actions[2].disabled = item.active || item.status !== 'CONFIGURED';
          actions[3].disabled = item.status !== 'FAILED';
          return actions;
        };

        scope.getCdmActions = (cdm) => {
          // console.log('cdm', cdm.id);
          $scope.fileFields.forEach((e) => {
            e.selected = e.resourceTypeMappingId === cdm.id;
          });
          // console.log('$scope.fileFields', $scope.fileFields);
          return $scope.fileFields;
        };

        scope.getReferences = (cdm) => {
          // not mapped fields;
          scope.references.forEach((e) => {
            e.selected = false;
          });

          $scope.mappedRatioFile.forEach((mapping) => {
            if (cdm.id === mapping.resourceTypeMappingId) {
              scope.references.forEach((e) => {
                e.selected = e.label === mapping.resource;
              });
            }
          });

          return scope.references;
        };

        scope.callbackFactory = (item) => (action) => {
          if (!scope[action.id]) {
            console.log('Not implemented');
            return;
          }
          scope[action.id](item);
        };

        scope.onMapping = (item) => {
          scope.focused = item;

          console.log('item', item);

          // additional field for ratio file;
          scope.ratioFile = isRatioType(item);
          scope.ratioFile
            ? events.emit('CLICK_ON_CDM_MAPPING_RATIO')
            : events.emit('CLICK_ON_CDM_MAPPING');

          $scope.mapping = true;
          $scope.cdmItems = [];
          clearForm();
          /* the `true` parameter is a work around the API  */
          $q
            /* .all([
              fileMappingsMockService.getAll(item.fileTypeId, undefined, true),
              fileColumnsMockService.getAll(item.id),
            ])*/
            .all([
              fileMappingsMockService.getAll(item.fileTypeId, undefined, true),
            ])
            .then((res) => {
              console.log('files mapping service mock', res);
              $scope.cdmItems = res[0].data;
              $scope.fileFields = res[1].data.map(buildFileField);
              // ratio file;
              $scope.mappedRatioFile = res[1].data.filter((e) => {
                return e.resourceTypeMappingId && e.resource;
              });
            })
            .finally(() => {
              $scope.mapping = false;
            });
        };

        scope.onDownload = (item) => {
          filesService.download(item, {format: 'CSV'}).catch((err) => {
            console.log(err);
          });
        };

        scope.onViewError = (item) => {
          const costpotPath = $routeParams.subCostpotId
            ? '/sub-costpots/' + $routeParams.subCostpotId
            : '';
          $location.path(
            '/cost-models/' +
              $routeParams.configId +
              '/costpots/' +
              $routeParams.costpotId +
              costpotPath +
              '/files/' +
              item.id +
              '/errors'
          );
        };

        scope.onSubmit = (form, action) => {
          switch (action) {
            case 'upload':
              upload(form);
              break;
            case 'mapping':
              mapping(form);
              break;
            case 'mappingRatio':
              mappingRatio(form);
              break;
            case 'setActive':
              setActive(form);
              break;
            case 'delete':
              deleteFile(form);
              break;
          }
        };

        scope.onSetActive = (item) => {
          scope.focused = item;
          events.emit('CONFIRM_SET_FILE_ACTIVE');
        };

        scope.onDelete = (item) => {
          scope.focused = item;
          events.emit('CONFIRM_DELETE_FILE');
        };

        scope.onGetAll = (tableState) => {
          if (!scope.fileTypes) {
            return;
          }
          scope.isLoading = true;

          // filesService
          filesMockService
            .getAll(scope.fileTypes, $scope.tableState, $scope.costpot.id)
            .then((result) => {
              scope.items = result.data;
              console.log('files back', result.data);
              if (scope.items.length === 0) {
                scope.errorOrNoData = 'No files have been uploaded';
              }
            })
            .catch((err) => {
              console.log('ERROR: ', err);
              scope.errorOrNoData = 'There is an error. See console log.';
            })
            .finally(() => {
              scope.isLoading = false;
            });
        };
        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          console.log(fn);
          scope[dropdownName] = fn;
        };
      };

      const bindEvents = (scope) => {
        events.on(EVENTS.CLICK_ON_UPLOAD_FILE, clearForm);
        scope.$on('$destroy', () => {
          events.off(EVENTS.CLICK_ON_UPLOAD_FILE, clearForm);
        });
      };

      const initRatioFileRefs = (scope) => {
        fileMappingsService.getAll('common').then((res) => {
          scope.references = res.data.map((e) => {
            return {
              label: e.name,
              value: e.name,
            };
          });
        });
      };

      const init = (scope) => {
        scope.formObj = {};
        scope.formObj1 = {};
        scope.formObj3 = {};
        scope.items = [];
        scope.isLoading = true;

        const configId = $routeParams.configId;
        const costpotId = $routeParams.subCostpotId || $routeParams.costpotId;

        setBreadcrumbs(
          configId,
          {id: $routeParams.costpotId, name: 'Loading...'},
          $routeParams.subCostpotId
        );

        console.log('configId', configId);
        console.log('costpotId', costpotId);

        // costpotsService
        costPotsMockService
          .getOne(configId, costpotId)
          .then((res) => {
            scope.costpot = res;
            setBreadcrumbs(
              configId,
              {id: $routeParams.costpotId, name: res.name},
              $routeParams.subCostpotId
            );
            return scope.costpot;
          })
          .then((costpot) => {
            console.log('costpot', costpot);

            /*
                cospot.resourceTypeId === fileType.resourceTypeId;
                fileType.id === file.fileTypeId;
                fileType.costPotId === costpot.id


            */

            // fileTypesService.getAll(costpot.resourceTypeId).then((res) => {
            fileTypesMockService.getAll(costpot.resourceTypeId).then((res) => {
              scope.fileTypes = res.data;
              console.log('fileTypesMockService....', scope.fileTypes);
              updateState();
              scope.fileTypeItems = scope.fileTypes.map(buildFileTypeItem);
            });

            /* fileTypesService.getAll(costpot.resourceTypeId).then((res) => {
              scope.fileTypes = res.data;
              console.log('scope.fileTypes', scope.fileTypes);
              updateState();
              scope.fileTypeItems = scope.fileTypes.map(buildFileTypeItem);
            });*/
          });

        augment(scope);
        // bindEvents(scope);
        // initRatioFileRefs(scope);
      };

      init($scope);
    },
  ]);
