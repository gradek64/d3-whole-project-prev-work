/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('components.notifications', [
    'vendors.modal',
    'utils.constants',
    'utils.events',
  ])
  .directive('notifications', [
    'events',
    'modalService',
    'CONSTANTS.EVENTS',
    (events, modalService, EVENTS) => {
      // code here executes once
      let nModal;
      let isMobile = true;
      const class1 = 'fade-and-drop';
      const class2 = 'slide-right';

      const resize = () => {
        if (window.innerWidth >= 768) {
          isMobile = false;
          nModal.changeClassName(class2);
        } else {
          isMobile = true;
          nModal.changeClassName(class1);
          bodyScroll(true);
          nModal.resetTop();
        }
      };

      const onOpen = () => {
        if (!isMobile) {
          bodyScroll(false);
        }
        nModal.open();
      };

      const onClose = () => {
        nModal.close();
        setTimeout(function() {
          bodyScroll(true);
        }, 200);
      };

      const bodyScroll = (enable) => {
        const o = enable ? '' : 'hidden';
        const w = enable ? '' : document.body.clientWidth + 'px';
        document.body.style.width = w;
        document.body.style.overflow = o;
      };

      const bindEvents = (scope) => {
        events.on(EVENTS.CLICK_ON_BELL, onOpen);
        nModal.closeButton.addEventListener('click', onClose);
        nModal.overlay.addEventListener('click', onClose);
        window.addEventListener('resize', resize);
        scope.$on('$destroy', function() {
          nModal.destroy();
          events.off(EVENTS.CLICK_ON_BELL, onOpen);
        });
      };

      const initModal = (scope, element) => {
        nModal = modalService({
          el: element[0].querySelector('.notifications'),
          bindEvents: false,
          className: class1,
          marginTop: '0px',
          noShadow: true,
        });
        resize();
        bindEvents(scope);
      };

      const link = (scope, element) => {
        // code here executes everytime the state changes
        initModal(scope, element);
      };

      return {
        restrict: 'EA',
        scope: {
          opts: '=',
        },
        templateUrl: 'components/notifications/notifications.html',
        link: link,
      };
    },
  ]);
