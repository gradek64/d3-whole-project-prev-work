/**
 * Created by Sergiu Ghenciu on 17/01/2018
 */

'use strict';

angular.
    module('vendors.material-forms.file-field', []).
    directive('fileField', [
      () => {
        const link = (scope, el) => {
          const fileInput = el[0].querySelector('input[type="file"]');

          if (!fileInput) {
            return;
          }

          const textInput = el[0].querySelector('.file-path');

          fileInput.addEventListener('change', () => {
            const files = Array.from(fileInput.files);

            scope.ngModel = files;
            textInput.value = files.map((e) => e.name).join(', ');

            const event = new Event('change');
            textInput.dispatchEvent(event);
          });
        };

        return {
          restrict: 'C',
          scope: {
            ngModel: '=',
          },
          link: link,
        };
      }]);
