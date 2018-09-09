/**
 * Created by Sergiu Ghenciu on 18/12/2017
 */

'use strict';

angular.module('components.lp-card', []).directive('lpCard', [
  function() {
    return {
      restrict: 'EA',
      scope: {
        item: '=',
      },
      template: `<div class="card lp" 
              ng-class="{disabled:item.disabled}">
                  <div class="card-content white-text">
                    <a href="{{::item.url}}">
                        <i svg-icon2="::item.icon.name"></i>
                        <div class="center-align title">
                          {{::item.title}}
                        </div>
                        <div ng-if="::item.desc"
                            class="description center-align">
                            {{::item.desc}}</div>
                   </a>
                  </div>
            </div>`,
    };
  },
]);
