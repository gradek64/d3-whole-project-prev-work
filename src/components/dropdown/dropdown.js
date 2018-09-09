/**
 * Created by Sergiu Ghenciu on 18/12/2017
 */

'use strict';

angular.module('components.dropdown', ['utils.events']).directive('dropdown', [
  'events',
  function(events) {
    const defaults = {
      gutter: 0,
      alignment: 'left',
      constrainwidth: false,
      beloworigin: false,
      hover: false,
      autoClose: true,
    };

    function closest(el, predicate) {
      return predicate(el) ? el : el && closest(el.parentNode, predicate);
    }

    function onClickOutside(scope, elements, cb) {
      const predicate = function(el) {
        return elements.some(function(e) {
          return e === el;
        });
      };

      const outsideClickListener = function(event) {
        if (!closest(event.target, predicate)) {
          if (cb) {
            cb();
          }
          // removeClickListener();
        }
      };

      scope.removeClickListener = function() {
        document.removeEventListener('click', outsideClickListener);
      };

      document.addEventListener('click', outsideClickListener);
    }

    function showDropdown(
      {gutter, alignment, constrainwidth, beloworigin, hover, cb},
      button,
      content,
      reds,
      scope
    ) {
      // // Constrain width
      if (constrainwidth === true) {
        content.style.width = button.clientWidth + 'px';
      }
      content.style.minWidth = button.clientWidth + 'px';

      // // OffScreen detection
      let offsetTop = button.offsetTop;

      // // Below Origin
      let verticalOffset = 0;
      if (beloworigin === true) {
        verticalOffset = button.clientHeight;
      }

      // // Check for scrolling positioned container.
      let scrollYOffset = 0;
      let scrollXOffset = 0;
      const wrapper = button.parentNode;
      if (wrapper.tagName !== 'BODY') {
        if (wrapper.scrollHeight > wrapper.clientHeight) {
          scrollYOffset = wrapper.scrollTop;
        }
        if (wrapper.scrollWidth > wrapper.clientWidth) {
          scrollXOffset = wrapper.scrollLeft;
        }
      }

      content.style.top =
        gutter + offsetTop + verticalOffset + scrollYOffset + 'px';
      content.style.left = button.offsetLeft + scrollXOffset + 'px';

      button.classList.add('active');
      content.classList.add('open');

      // adjust position
      if (alignment === 'right') {
        const rightOfButton = button.offsetLeft + button.clientWidth;

        content.style.left =
          rightOfButton - content.clientWidth + scrollXOffset + 'px';
      }

      // Add click close handler to document
      setTimeout(function() {
        onClickOutside(scope, reds, function() {
          hideDropdown({constrainwidth, cb}, button, content, scope);
        });
      }, 0);

      cb(true);
    }

    function hideDropdown({constrainwidth, cb}, button, content, scope) {
      content.classList.remove('open');
      button.classList.remove('active');
      scope.removeClickListener();
      cb(false);
    }

    const bindEvents = (scope, options, button, content, reds) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (button.classList.contains('active')) {
          hideDropdown(options, button, content, scope);
        } else {
          showDropdown(options, button, content, reds, scope);
        }
      });

      const destroy = () => {
        if (button.classList.contains('active')) {
          hideDropdown(options, button, content, scope);
        }
      };

      // FIX destroy dropdown when changing pagination on smart-table
      events.on('ST-PAGINATION-CHANGED', destroy);

      scope.$on('$destroy', () => {
        destroy();

        // FIX destroy dropdown when changing pagination on smart-table
        events.off('ST-PAGINATION-CHANGED', destroy);
      });
    };

    const init = (scope, elm) => {
      const button = elm[0];
      const content = document.querySelector('#' + scope.opts.activates);
      const options = Object.assign({}, defaults, scope.opts);

      const reds = [button];
      if (!options.autoClose) {
        reds.push(content);
      }

      options.cb = scope.callback() || function() {};

      bindEvents(scope, options, button, content, reds);
    };

    const link = (scope, elm) => {
      angular.element(document).ready(() => {
        init(scope, elm);
      });
    };

    return {
      restrict: 'A',
      scope: {
        opts: '=dropdown',
        callback: '&',
      },
      link: link,
    };
  },
]);
