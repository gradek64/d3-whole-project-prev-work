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
        modal.open();
      };

      const onCloseFactory = (scope, modal) => (force) => {
        if (force === true || !scope.opts.freeze) {
          modal.close();
        }
      };

      const bind = (fn, toggle) => (name) => {
        if (EVENTS[name]) {
          events[toggle](EVENTS[name], fn);
        } else {
          console.warn(`${name} does not exist in CONSTANTS.EVENTS`);
        }
      };

      const bindStringOrArray = (event, fn, toggle = 'on') => {
        if (Array.isArray(event)) {
          event.map(bind(fn, toggle));
        } else if (typeof event === 'string') {
          bind(fn, toggle)(event);
        }
      };

      const bindEvents = (scope, modal) => {
        const onOpen = onOpenFactory(modal);
        const onClose = onCloseFactory(scope, modal);
        const openForced = () => onOpen(true);
        const closeForced = () => onClose(true);

        bindStringOrArray(scope.opts.showOn, openForced);
        bindStringOrArray(scope.opts.hideOn, closeForced);

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
        const modal = modalService(
          Object.assign({}, scope.opts, {el: el, bindEvents: false})
        );
        bindEvents(scope, modal);
        return modal;
      };

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
