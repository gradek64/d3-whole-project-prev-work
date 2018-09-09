/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular.module('components.top-nav', []).directive('topNav', [
  () => {
    return {
      restrict: 'EA',
      scope: {
        items: '=',
        opts: '=',
      },
      template: `<nav class="top-nav">
            <div class="nav-wrapper container" >
              <a class="title">{{::opts.title}}</a>
              <ul class="right">
                <li class="item" ng-repeat="item in items track by $index" 
                          ng-class="{active: item.active}">
                  <a href="{{::item.href}}" ng-class="{disabled:item.disabled}">
                    <div>
                      <i svg-icon2="item.icon.name" 
                          opts="{color: item.icon.color}"></i>
                    </div>
                    <span>{{::item.label}}</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>`,
    };
  },
]);
