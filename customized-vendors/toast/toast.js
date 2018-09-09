'use strict';

angular.
    module('vendors.toast', []).
    factory('toastService', () => {
      const Toast = (message, props) => {
        /* eslint-disable */
        const defaults = {
          className: '',
          duration: 4000,
          onComplete: null,
          transitionIn: 'transform 300ms cubic-bezier(0.215, 0.61, 0.355, 1), opacity 300ms cubic-bezier(0.215, 0.61, 0.355, 1)',
          transitionOut: 'transform 375ms cubic-bezier(0.19, 1, 0.22, 1), opacity 375ms cubic-bezier(0.19, 1, 0.22, 1)',
        };
        /* eslint-enable */

        function destroy(cb) {
          toast.style.transition = options.transitionOut;
          toast.style.transform = 'translate(0, -40px)';
          toast.style.opacity = 0;

          setTimeout(function() {
            // Call the optional callback
            if (typeof(cb) === 'function') {
              cb();
            }
            // Remove toast after it times out
            container.removeChild(toast);
          }, 375);
        }

        function create(html) {
          const toast = document.createElement('div');
          toast.classList.add('toast');
          toast.classList.add('z-depth-1');

          if (options.className) {
            options.className.
                split(' ').
                forEach((e) => {
                  toast.classList.add(e);
                });
          }
          if (html instanceof HTMLElement) {
            toast.appendChild(html);
          } else {
            toast.innerHTML = html;
          }
          return toast;
        }

        // init
        const options = Object.assign({}, defaults, props);
        let container = document.getElementById('toast-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'toast-container';
          document.body.appendChild(container);
        }

        const toast = create(message);

        toast.style.transform = 'translate(0, 35px)';
        toast.style.opacity = 0;
        toast.style.transition = options.transitionIn;

        if (message) {
          container.appendChild(toast);
        }

        toast.offsetHeight; // :)
        toast.style.transform = 'translate(0, 0)';
        toast.style.opacity = 1;

        /*
         * if (duration === Infinity) return the toast
         *
         * the toast.destroy(onComplete) method will be available
         */
        if (options.duration === Infinity) {
          return {
            toast,
            destroy,
          };
        }

        // Allows timer to be pause while being panned
        let timeLeft = options.duration;
        const counterInterval = setInterval(function() {

          if (toast.parentNode === null) {
            window.clearInterval(counterInterval);
          }

          // If toast is not being dragged, decrease its time remaining
          if (!toast.classList.contains('panning')) {
            timeLeft -= 20;
          }

          if (timeLeft <= 0) {
            window.clearInterval(counterInterval);
            destroy(options.onComplete);
          }
        }, 20);
      };
      return Toast;
    });
