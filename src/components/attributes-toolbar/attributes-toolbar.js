/**
 * Created by Greg Gil on 05/01/2018
 */

'use strict';

angular
  .module('components.attributes-toolbar', [
    'components.attribute-container',
    'utils.misc',
  ])
  .directive('attributesToolbar', [
    'misc',
    '$compile',
    function(_, $compile) {
      const appendHeadToTail = _.converge(_.append, [_.head, _.tail]);

      const link = (scope, element) => {
        const boxes = element[0].querySelector('.boxes');
        let right = false;
        let left = false;
        const first = scope.opts[0];
        const last = scope.opts[scope.opts.length - 1];
        scope.moveRight = () => {
          scope.showLeftArrow = scope.opts[0] !== last;
          boxes.classList.add('transition', 'move-right');
          right = true;
          left = false;
        };

        scope.moveLeft = () => {
          scope.showLeftArrow = scope.opts[scope.opts.length - 1] !== first;
          boxes.classList.add('move-left-align');
          scope.opts = _.prepend(_.last(scope.opts), _.init(scope.opts));

          /* needed for applying css animation
          esppecially Firefox */
          setTimeout(function() {
            boxes.classList.add('transition', 'move-left');
            right = false;
            left = true;
          }, 100);
        };

        boxes.addEventListener(
          'transitionend',
          (e) => {
            if (left) {
              boxes.classList.remove(
                'move-left-align',
                'transition',
                'move-left'
              );
            }

            if (right) {
              boxes.classList.remove('transition', 'move-right');
              scope.opts = appendHeadToTail(scope.opts);
              scope.$digest();
            }
          },
          false
        );
      };
      return {
        restrict: 'EA',
        scope: {
          opts: '=',
          callback: '&',
        },
        link: link,
        template: `<div class="attributes-toolbar">
    <div class="container">
    <span class="title">Attributes</span>
    <div class="attributes-component">
        <span ng-style="{'opacity' : opts.length>5 && showLeftArrow ? 1 : 0}"  
        class="arrows" ng-click="moveLeft();">
         <i svg-icon2="'arrowRight'"></i></span>
        <div class="boxes-wrapper">
          <div class='boxes'>
             <attribute-container class="box" 
             opts='box' ng-repeat="box in opts track by $index">
             </attribute-container>
         </div>
        </div>
        <span ng-if="opts.length>5" class="arrows" ng-click="moveRight();">
        <i svg-icon2="'arrowRight'"></i>
    </div>
</div>`,
      };
    },
  ]);
