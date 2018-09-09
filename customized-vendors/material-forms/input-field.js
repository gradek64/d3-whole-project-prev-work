/**
 * Created by Sergiu Ghenciu on 21/12/2017
 */

'use strict';

angular.
    module('vendors.material-forms.input-field', []).
    directive('inputField', [
      () => {
        const link = (scope, el) => {
          const input = el[0].querySelector(
              'input[type=text]:not(.select-dropdown),' +
              'input[type=password],' +
              'input[type=email],' +
              'input[type=url],' +
              'input[type=tel],' +
              'input[type=number],' +
              'input[type=search],' +
              'textarea');

          if (!input) {
            return;
          }

          const i = el[0].querySelector('.prefix');
          const label = el[0].querySelector('label');

          input.addEventListener('focus', () => {
            if (i) {
              i.classList.add('active');
            }
            if (label) {
              label.classList.add('active');
            }
          });

          input.addEventListener('blur', () => {
            if (i) {
              i.classList.remove('active');
            }
            if (label) {
              if (input.value.length === 0 &&
                  input.getAttribute('placeholder') === null) {
                label.classList.remove('active');
              }
            }
          });
        };

        return {
          restrict: 'C',
          link: link,
        };
      }]);
