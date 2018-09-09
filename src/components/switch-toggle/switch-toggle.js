/**
 * Created by Greg Gil on 27/12/2017
 */

'use strict';

angular
  .module('components.switch-toggle', [])
  .directive('switchToggle', function() {
    return {
      restrict: 'EA',
      scope: {
        callback: '&?',
        label: '=',
        state: '=',
      },
      template: `<div class="switch">
                  <label>
                    {{label}}
                    <input type="checkbox" ng-model="state" 
                    ng-change="callback()(state)">
                    <span class="lever"></span>
                  </label>
                </div>`,
    };
  });
