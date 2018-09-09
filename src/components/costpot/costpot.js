/**
 * Created by Sergiu Ghenciu on 03/01/2018
 */

'use strict';

angular.module('components.costpot', []).directive('costpot', function() {
  return {
    restrict: 'EA',
    scope: {
      opts: '=',
      callback: '&',
    },
    template:
      '<div class="card-panel costpot center-align">' +
      '<div ng-switch="opts.icon">' +
      '<div ng-switch-when="svgLedger" ' +
      'svg-ledger opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgContracts" ' +
      'svg-contracts opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgLabour" ' +
      'svg-labour opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgRecoveries" ' +
      'svg-recoveries opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgResourceStack" ' +
      'svg-resource-stack opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgInfrastructure" ' +
      'svg-infrastructure opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgService" ' +
      'svg-service opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '<div ng-switch-when="svgCapabilities" ' +
      'svg-capabilities opts="{color: \'#0e0e0e\', height:55, width:55}">' +
      '</div>' +
      '</div>' +
      '<h6>{{::opts.name}}</h6>' +
      '<div>' +
      '<i ng-if="!opts.hideAdd" svg-icon="costpot" ' +
      'class="pot waves-effect" ' +
      'ng-click="callback()(\'onView\');$event.preventDefault()"></i>' +
      '<i ng-if="!opts.hideFile" svg-icon="fileManagement" ' +
      'class="file waves-effect" ' +
      'ng-click="callback()(\'onFile\');$event.preventDefault()"></i>' +
      '<i ng-if="!opts.hideFilter" svg-icon="dataSetFilters" ' +
      'class="filter waves-effect" ' +
      'ng-click="callback()(\'onFilter\');$event.preventDefault()"></i>' +
      '<i ng-if="!opts.hideDelete" svg-icon="delete" ' +
      'class="delete waves-effect" ' +
      'ng-click="callback()(\'onDelete\');$event.preventDefault()"></i>' +
      '</div>' +
      '</div>',
  };
});
