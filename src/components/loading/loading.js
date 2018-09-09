/**
 * Created by Sergiu Ghenciu on 20/12/2017
 */

'use strict';

angular.module('components.loading', []).directive('loading', () => {
  return {
    restrict: 'EA',
    scope: {
      opts: '=',
    },
    template: `<div class="loading" style="position:absolute; z-index:800;
                                          top:0; right:0; bottom:0; left:0;
                                          background: rgba(255,255,255,0.6);
                                          display:flex; justify-content:center;
                                          align-items:center;line-height:1.5;">
                    <div>
        
                      <div class="preloader-wrapper {{opts.size}} active">
                        <div class="spinner-layer spinner-{{opts.color}}-only">
                          <div class="circle-clipper left">
                            <div class="circle"></div>
                          </div><div class="gap-patch">
                            <div class="circle"></div>
                          </div><div class="circle-clipper right">
                            <div class="circle"></div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>`,
  };
});
