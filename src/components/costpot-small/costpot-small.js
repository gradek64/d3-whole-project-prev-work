/**
 * Created by Sergiu Ghenciu on 05/01/2018
 */

'use strict';

angular
  .module('components.costpot-small', [])
  .directive('costpotSmall', function() {
    return {
      restrict: 'EA',
      scope: {
        opts: '=',
        callback: '&',
      },
      template:
        '<div class="card-panel flex costpot-small">' +
        '<span class="stretch">{{::opts.name}}</span>' +
        '<i ng-if="!opts.hideAdd" svg-icon="plus" ' +
        'class="add waves-effect" ' +
        'ng-click="callback()(\'onCreate\');$event.preventDefault()"></i>' +
        '<i ng-if="!opts.hideFile" svg-icon="fileManagement" ' +
        'class="file waves-effect" ' +
        'ng-click="callback()(\'onFile\');$event.preventDefault()"></i>' +
        '<i ng-if="!opts.hideFilter" svg-icon="dataSetFilters" ' +
        'class="filter waves-effect" ' +
        'ng-click="callback()(\'onFilter\');$event.preventDefault()"></i>' +
        '<i ng-if="!opts.hideDelete" svg-icon="delete" ' +
        'class="delete waves-effect" ' +
        'ng-click="callback()(\'onDelete\');$event.preventDefault()"></i>' +
        '</div>',
    };
  });
