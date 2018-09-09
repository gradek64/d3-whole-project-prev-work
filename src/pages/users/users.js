/**
 * Created by Sergiu Ghenciu on 03/04/2018
 */

'use strict';

angular
  .module('pages.users', [
    'ngRoute',
    'utils.misc',
    'utils.constants',
    'utils.events',
    'services.users-service',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/users', {
        templateUrl: 'pages/users/users.html',
        controller: 'UsersCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ADMIN],
        },
        name: 'users',
      });
    },
  ])
  .controller('UsersCtrl', [
    'misc',
    '$scope',
    'events',
    'CONSTANTS.EVENTS',
    'usersService',
    '$route',
    function(_, $scope, events, EVENTS, usersService, $route) {
      // const updateState = () => {
      //   $scope.errorOrNoData = '';
      //   $scope.onGetAll($scope.tableState);
      // };

      const setBreadcrumbs = (scope) => {
        scope.breadcrumbs = [
          {
            href: '/#!/users',
            label: 'User Management',
          },
        ];
      };

      const clearForm = () => {
        $scope.formObj = {};
      };

      const del = (item) => {
        if (!item.id) {
          return;
        }
        $scope.deleting = true;
        usersService
          .delete(item.id)
          .then((res) => {
            const index = $scope.items.findIndex((e) => e.id === item.id);
            $scope.items.splice(index, 1);
            events.emit('USER_DELETED');
          })
          .catch((err) => {
            $scope.error = err;
          })
          .finally(() => {
            $scope.deleting = false;
          });
      };

      const augment = (scope) => {
        scope.emit = events.emit;

        const actions = [{label: 'Delete', id: 'onDelete'}];
        scope.getActions = (item) => {
          return actions;
        };

        scope.callbackFactory = (item) => (action) => {
          scope[action.id](item);
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

        scope.onDelete = (item) => {
          scope.focused = item;
          events.emit('CONFIRM_DELETE_USER');
        };

        scope.onGetAll = (tableState) => {
          scope.isLoading = true;

          scope.errorOrNoData = null;
          usersService
            .getAll(tableState)
            .then((result) => {
              scope.items = result.data.sort(_.compareFactory('fullName'));
              console.log(scope.items);
              if (scope.items.length === 0) {
                scope.errorOrNoData = 'No entries';
                return;
              }

              scope.totalItemCount = result.totalItemCount;
              tableState.pagination.numberOfPages = Math.ceil(
                scope.totalItemCount / scope.itemsByPage
              );
              scope.startIndex = tableState.pagination.start;

              scope.tableState = tableState;
            })
            .catch((err) => {
              console.log('ERROR: ', err);
              scope.items = [];
              scope.errorOrNoData = 'There is an error. See console log.';
            })
            .finally(() => {
              scope.isLoading = false;
            });
        };
      };

      const bindEvents = (scope) => {
        const justForR3 = () => {
          $route.reload();
        };
        events.on(EVENTS.CLICK_ON_CREATE_USER, clearForm);

        events.on(EVENTS.LOGIN_SUCCESS, justForR3);
        scope.$on('$destroy', () => {
          events.off(EVENTS.CLICK_ON_CREATE_USER, clearForm);
          events.off(EVENTS.LOGIN_SUCCESS, justForR3);
        });
      };

      const init = (scope) => {
        scope.formObj = {};
        scope.items = [];
        scope.isLoading = true;

        scope.startIndex = 0;
        scope.itemsByPage = 200;
        scope.displayedPages = 10;

        setBreadcrumbs(scope);

        augment(scope);
        bindEvents(scope);
      };

      init($scope);
    },
  ]);
