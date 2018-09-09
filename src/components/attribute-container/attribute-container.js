/**
 * Created by Greg Gil on 05/01/2018
 */

'use strict';

angular
  .module('components.attribute-container', [])
  .directive('attributeContainer', function() {
    const link = (scope, element) => {
      scope.selected = false;
      scope.toggle = () => {
        scope.opts.selected = !scope.opts.selected;
      };
    };
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        opts: '=',
        toggle: '&',
      },
      link: link,
      template: `<div>
          <div class="attribute-container">
          
          <span class="label">{{opts.label}}</span> 
          <div class="icon-container" ng-click="toggle()"> 
            <div class="icon" ng-if="!opts.selected">
                <i svg-icon2="'plus'"></i></div> 
            <div class="icon" ng-if="opts.selected">
                <i svg-icon2="'minus'"></i></div> 
          </div> 

          </div>
        </div>`,
    };
  });
