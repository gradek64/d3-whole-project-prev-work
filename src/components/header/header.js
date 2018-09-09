/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('components.header', [
    'utils.events',
    'utils.constants',
    'services.auth-service',
    'vendors.toast',
  ])
  .directive('appHeader', [
    'events',
    'authService',
    'toastService',
    'CONSTANTS.EVENTS',
    (events, authService, toast, EVENTS) => {
      const augment = (scope) => {
        scope.emit = events.emit;

        scope.onLogout = ($event) => {
          $event.preventDefault();

          const wait = toast('Logging out...', {duration: Infinity});
          authService
            .logout()
            .then(() => {
              // simulating a delay
              setTimeout(() => {
                wait.destroy();
                setTimeout(() => {
                  toast('Logout successful');
                }, 375);
                setTimeout(() => {
                  events.emit('LOGOUT_SUCCESS');
                }, 500);
              }, 1000);
            })
            .catch((err) => {
              wait.destroy();
              setTimeout(() => {
                toast('Logout failed');
              }, 375);
              console.warn('LOGOUT_FAILED', err);
            });
        };

        scope.isAuthorised = authService.isAuthorised;
      };

      const initUserFactory = (scope) => () => {
        scope.user = authService.getUser();
      };

      const bindEvents = (scope) => {
        const initUser = initUserFactory(scope);
        events.on(EVENTS.LOGIN_SUCCESS, initUser);

        scope.$on('$destroy', () => {
          events.off(EVENTS.LOGIN_SUCCESS, initUser);
        });
      };

      const init = (scope) => {
        scope.user = authService.getUser();
        augment(scope);
        bindEvents(scope);
      };
      return {
        restrict: 'EA',
        scope: {
          opts: '=',
          logo: '=',
        },
        templateUrl: 'components/header/header.html',
        link: init,
      };
    },
  ]);
