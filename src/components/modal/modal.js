/**
 * Created by Sergiu Ghenciu on 19/12/2017
 */

'use strict';
/*
* options:
* showOn (arr|str),
* hideOn (arr|str),
* closeButton (bool)
* overlayColor (str) (className)
* freeze (bool)
* */
angular
  .module('components.modal', [
    'vendors.modal',
    'utils.constants',
    'utils.events',
  ])
  .directive('modal', [
    'modalService',
    'events',
    'CONSTANTS.EVENTS',
    function(modalService, events, EVENTS) {
      // code here executes once

      const onOpenFactory = (modal) => () => {
        console.log('onOpenFactory');
        modal.open();
      };

      const onCloseFactory = (scope, modal) => (force) => {
        if (force === true || !scope.opts.freeze) {
          modal.close();
        }
      };

      const bind = (fn, toggle) => (name) => {
        if (EVENTS[name]) {
          console.log('.....bind custom event.....');
          console.log('register events for modal');

          console.log('function assined to custom events', fn);

          events[toggle](EVENTS[name], fn);
        } else {
          console.warn(`${name} does not exist in CONSTANTS.EVENTS`);
        }
      };

      /*
        *@this is where you bind/create custom events
        *@
      */
      const bindStringOrArray = (event, fn, toggle = 'on') => {
        if (Array.isArray(event)) {
          event.map(bind(fn, toggle));
        } else if (typeof event === 'string') {
          bind(fn, toggle)(event);
        }
      };

      const bindEvents = (scope, modal) => {
        console.log('scope.opts.showOn', scope.opts.showOn);
        const onOpen = onOpenFactory(modal);
        const onClose = onCloseFactory(scope, modal);
        const openForced = () => onOpen(true);
        const closeForced = () => onClose(true);

        bindStringOrArray(scope.opts.showOn, openForced);
        bindStringOrArray(scope.opts.hideOn, closeForced);
        console.log(modal);

        if (modal.closeButton) {
          modal.closeButton.addEventListener('click', onClose);
        }
        if (modal.overlay) {
          modal.overlay.addEventListener('click', onClose);
        }

        scope.$on('$destroy', () => {
          modal.destroy();
          bindStringOrArray(scope.opts.showOn, openForced, 'off');
          bindStringOrArray(scope.opts.hideOn, closeForced, 'off');
        });
      };

      const init = (scope, element) => {
        const el = element[0];
        el.classList.add('modal');
        console.log('this is element from modal component', element[0]);

        /*
          *@extend element with ModalService so
          *@U can attach additional propertie and method
          *@important U need to send element to the factory !
        */
        const modal = modalService(
          Object.assign({}, scope.opts, {el: el, bindEvents: false})
        );

        /*
          *@below is where U bind custom events to the modalService;
          *@
        */
        bindEvents(scope, modal);

        console.log('before exteding modal from modalService', el);
        console.log(
          'modal from modalService after exteding with modalService',
          modal
        );
        return modal;
      };

      /*
        *@once directive is compile initiate it
        *@
      */

      const link = (scope, elm) => {
        init(scope, elm);
      };

      return {
        restrict: 'A',
        scope: {
          opts: '=modal',
        },
        link: link,
      };
    },
  ]);
