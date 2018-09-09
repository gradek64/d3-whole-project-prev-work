/**
 * Created by Sergiu Ghenciu on 19/12/2017
 */

'use strict';

angular
  .module('components.login-form', [
    'services.auth-service',
    'utils.events',
    'utils.constants',
  ])
  .directive('loginForm', [
    'authService',
    'events',
    'CONSTANTS.EVENTS',
    (authService, events, EVENTS) => {
      const augment = (scope) => {
        scope.credentials = {
          username: '',
          password: '',
          remember: false,
        };

        scope.onSubmit = ($event, credentials) => {
          $event.preventDefault();
          scope.isLoading = true;
          authService
            .login(credentials)
            .then((res) => {
              console.log('LOGIN_SUCCESS', res);
              events.emit('LOGIN_SUCCESS');
            })
            .catch((err) => {
              scope.error = err.data.description;
            })
            .finally(() => {
              scope.isLoading = false;
            });
        };
      };

      const clearFactory = (scope) => () => {
        if (scope.form) {
          scope.form.$setPristine();
        }
        scope.error = null;

        if (!scope.$$phase && !scope.$root.$$phase) {
          scope.$digest();
        }
      };

      const bindEvents = (scope) => {
        const clear = clearFactory(scope);
        events.on(EVENTS.LOGOUT_SUCCESS, clear);
        events.on(EVENTS.NOT_AUTHENTICATED, clear);

        scope.$on('$destroy', () => {
          events.off(EVENTS.LOGIN_SUCCESS, clear);
          events.off(EVENTS.NOT_AUTHENTICATED, clear);
        });
      };

      const link = (scope) => {
        augment(scope);
        bindEvents(scope);
        events.emit('LOGIN_FORM_IS_READY');
      };

      return {
        restrict: 'EA',
        scope: {
          opts: '=',
        },
        templateUrl: 'components/login-form/login-form.html',
        link: {
          post: link,
        },
      };
    },
  ]);
