/*
 * Modal
 * @author Sergiu Ghenciu
 * License: Dedicated to the public domain.
 *
 */

'use strict';

angular.
    module('vendors.modal', []).
    factory('modalService', () => {
      function Modal(props) {
        const defaults = {
          autoOpen: false,
          className: 'create-content',
          closeButton: true,
          overlay: true,
          bindEvents: true,
        };

        function bindEvents() {
          if (closeButton) {
            closeButton.addEventListener('click', close);
          }
          if (overlay) {
            overlay.addEventListener('click', close);
          }
        }

        function onTransitionEnd(e) {
          e.target.classList.remove(options.className);
          e.target.removeEventListener(e.type, onTransitionEnd); // Self-Remove
        }

        function close() {
          if (isOpen()) {
            modal.classList.remove('open');
            overlay && overlay.classList.remove('open');
            modal.addEventListener(transitionEventName, onTransitionEnd);
            overlay &&
            overlay.addEventListener(transitionEventName, onTransitionEnd);
          }
        }

        function isOpen() {
          return modal.classList.contains('open');
        }

        function open() {
          console.log('open modal!!');
          modal.classList.add(options.className);
          overlay && overlay.classList.add(options.className);

          resetTop();

          setTimeout(function() {
            modal.classList.add('open');
            overlay && overlay.classList.add('open');
          }, 0);
        }

        function resetTop() {
          const top = isAnchored ?
              options.marginTopAnchored :
              options.marginTop;
          modal.style.top = 'calc(' + window.scrollY + 'px + ' + top + ')';
        }

        function anchor() {
          isAnchored = true;
          modal.classList.add('anchored');
          resetTop();
        }

        function unAnchor() {
          isAnchored = false;
          modal.classList.remove('anchored');
          resetTop();
        }

        function buildOut() {
          /*
            *@modalService buildOut function
            *@place where you assign your modal from options
          */
          modal = options.el;
          modal.classList.add('modal');
          if (!options.noShadow) {
            modal.classList.add('z-depth-4');
          }
          if (!options.marginTop) {
            options.marginTop = window.getComputedStyle(modal).top || '10%';
          } // from css
          if (!options.marginTopAnchored) {
            options.marginTopAnchored = '0px';
          }

          // If closeButton option is true, add a close button
          if (options.closeButton === true) {
            console.log('close button');
            closeButton = document.createElement('button');
            closeButton.className = 'close close-button';
            console.log(modal);
            // modal.appendChild(closeButton);
          }

          // If overlay is true, add one
          if (options.overlay === true) {
            overlay = document.createElement('div');
            let cn = 'modal-overlay';
            if (options.overlayColor) {
              cn += ' ' + options.overlayColor;
            }
            overlay.className = cn;

            // modal.parentNode.insertBefore(overlay, modal);
            document.querySelector('body').appendChild(overlay);
          }
        }

        function transitionSelect() {
          const el = document.createElement('div');
          if (el.style.WebkitTransition) {
            return 'webkitTransitionEnd';
          }
          if (el.style.OTransition) {
            return 'oTransitionEnd';
          }
          return 'transitionend';
        }

        function changeClassName(newClass) {
          const oldClass = options.className;
          options.className = newClass;

          if (isOpen()) {
            modal.classList.add('transition-off');
            modal.classList.add(newClass);
            if (overlay) {
              overlay.classList.add(newClass);
            }
            if (oldClass !== newClass) {
              modal.classList.remove(oldClass);
              if (overlay) {
                overlay.classList.remove(oldClass);
              }
            }
            setTimeout(function() {
              modal.classList.remove('transition-off');
            }, 100);
          }
        }

        function destroy() {
          close();
          overlay && overlay.remove();
        }

        // init
        let modal = null;
        let overlay = null;
        let closeButton = null;
        const transitionEventName = transitionSelect();
        let isAnchored = false;
        /*
          *@options are send in prop
          *@and they have options.el which is component modoal directive
          *@where this service is called from
        */
        let options = Object.assign({}, defaults, props);
        buildOut();
        if (options.bindEvents === true) {
          bindEvents();
        }
        if (options.autoOpen === true) {
          open();
        }

        return {
          overlay,
          closeButton,
          isOpen,
          open,
          close,
          anchor,
          unAnchor,
          resetTop,
          changeClassName,
          options,
          destroy,
        };
      }

      return Modal;
    });
