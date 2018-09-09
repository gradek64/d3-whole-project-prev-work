/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('see.side-nav', ['vendors.modal', 'utils.constants', 'utils.events'])
  .directive('sideNav', [
    'events',
    'modalService',
    'CONSTANTS.EVENTS',
    (events, modalService, EVENTS) => {
      // code here executes once
      let snModal;

      const bindEvents = (scope) => {
        const open = () => {
          snModal.open();
        };
        events.on(EVENTS.CLICK_ON_HAMBURGER_MENU, open);

        scope.$on('$destroy', function() {
          events.off(EVENTS.CLICK_ON_HAMBURGER_MENU, open);
          nModal.destroy();
        });
      };

      const initSn = (element) => {
        snModal = modalService({
          el: element[0].querySelector('.side-nav'),
          bindEvents: true,
          className: 'slide-left',
          noShadow: true,
        });
      };

      const link = (scope, element) => {
        // code here executes everytime the state changes
        initSn(element);
        bindEvents(scope);
      };

      return {
        restrict: 'EA',
        scope: {
          opts: '=',
        },
        templateUrl: 'components/side-nav/side-nav.html',
        link: link,
      };
    },
  ]);
