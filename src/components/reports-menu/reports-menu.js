/**
 * Created by Greg Gil on 27/12/2017
 */

'use strict';

angular
  .module('components.reports-menu', [])
  .directive('reportsMenu', function() {
    return {
      restrict: 'EA',
      scope: {
        toggleCallback: '=',
        toggleState: '=',
        items: '=',
        total: '=',
        totalLabel: '=',
      },
      template: `
         <nav class="reports-menu">
                <div class="nav-wrapper container">
                    <div class="left">
                    <switch-toggle 
                        label="'Variance'" 
                        state="toggleState"
                        callback="toggleCallback"></switch-toggle>
                    </div>
                    <div class="right total">
                      <div>{{totalLabel}}</div>
                      <div>{{total}}</div>
                    </div>
                    <div class="reports-nav">
                      <ul>
                        <li class="item" 
                        ng-repeat="item in items track by $index"
                                  ng-class="{active: item.active}">
                          <a href="{{item.href}}">{{item.label}}</a>
                        </li>
                      </ul>
                    </div>
              </div>
          </nav>`,
    };
  });
