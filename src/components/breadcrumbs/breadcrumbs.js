/**
 * Created by Sergiu Ghenciu on 27/12/2017
 */

'use strict';

angular
  .module('components.breadcrumbs', [])
  .directive('breadcrumbs', function() {
    return {
      restrict: 'EA',
      scope: {
        opts: '=',
        items: '=',
        total: '=',
        totalLabel: '=',
      },
      template: `<nav class="breadcrumbs white">
            <div class="nav-wrapper container">
              <div class="left">
                <a data-ng-repeat="item in items" href="{{item.href}}"
                    class="breadcrumb">{{item.label}}</a>
              </div>
              <div class="right total">
                      <div>{{totalLabel}}</div>
                      <div>{{total}}</div>
                    </div>
            </div>
        </nav>`,
    };
  });
