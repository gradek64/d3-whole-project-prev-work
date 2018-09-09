/**
 * Created by Sergiu Ghenciu on 20/12/2017
 */

'use strict';

/* eslint-disable */
angular
  .module('components.svg-icons', [])
  .directive('svgIcon', function() {
    return {
      scope: {
        opts: '=?'
      },
      link: function(scope) {
        if (!scope.opts) {
          scope.opts = { color: '#7d7d7d' };
        }
      },
      templateUrl: function(el, attr) {
        return '/components/svg-icons/' + attr.svgIcon + '.svg';
      }
    };
  })
  .directive('svgIcon2', [
    '$compile',
    function($compile) {
      return {
        scope: {
          opts: '=?',
          svgIcon: '=svgIcon2'
        },
        link: function(scope, element, attr) {
          if (!scope.opts) {
            scope.opts = { color: '#7d7d7d' };
          }
          element.replaceWith(
            $compile(
              '<i ng-include="\'/components/svg-icons/' +
                scope.svgIcon +
                '.svg\'"></i>'
            )(scope)
          );
        }
      };
    }
  ])
  .directive('svgArrowDown', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g><path transform="rotate(270 11.951939582824707,11.994384765625)" d="m17.196931,22.486418l-10.489989,-10.491632l10.489989,-10.492434" fill-opacity="null" stroke-width="0.5" stroke="{{opts.color}}" fill="none"></path></g></svg>'
    };
  })
  .directive('svgBell', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 23.999999999999996 23.999999999999996" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g><path stroke="{{opts.color}}" fill="none" stroke-width="0.5" d="m12,22c1.1,0 2,-0.9 2,-2l-4,0c0,1.1 0.9,2 2,2zm6,-6l0,-5c0,-3.07 -1.63,-5.64 -4.5,-6.32l0,-0.68c0,-0.83 -0.67,-1.5 -1.5,-1.5s-1.5,0.67 -1.5,1.5l0,0.68c-2.86,0.68 -4.5,3.24 -4.5,6.32l0,5l-2,2l0,1l16,0l0,-1l-2,-2z"></path></g></svg>'
    };
  })
  .directive('svgMagnifyingGlass', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24.000000000000004 24.000000000000004" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g><ellipse stroke-width="0.5" transform="rotate(3 10.090603828430257,9.683909416198727)" stroke="{{opts.color}}" ry="8.369066" rx="8" id="svg_15" cy="9.683909" cx="10.090604" fill="none"></ellipse><rect stroke="{{opts.color}}" transform="rotate(-44.651065826416016 20.001754760742184,19.88848876953125) " id="svg_16" height="8.113637" width="1.790591" y="15.83167" x="19.106459" stroke-width="0.5" fill="none"></rect><rect stroke="{{opts.color}}" transform="rotate(-44.651065826416016 16.393535614013672,16.314237594604492) " id="svg_17" height="1.937527" width="1.000266" y="15.345474" x="15.893403" stroke-width="0.5" fill="none"></rect></g></svg>'
    };
  })
  .directive('svgSettings', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="m0,0l24,0l0,24l-24,0l0,-24z"></path><path stroke-width="0.5" stroke="{{opts.color}}" fill="none" id="svg_2" d="m19.43,12.98c0.04,-0.32 0.07,-0.64 0.07,-0.98s-0.03,-0.66 -0.07,-0.98l2.11,-1.65c0.19,-0.15 0.24,-0.42 0.12,-0.64l-2,-3.46c-0.12,-0.22 -0.39,-0.3 -0.61,-0.22l-2.49,1c-0.52,-0.4 -1.08,-0.73 -1.69,-0.98l-0.38,-2.65c-0.03,-0.24 -0.24,-0.42 -0.49,-0.42l-4,0c-0.25,0 -0.46,0.18 -0.49,0.42l-0.38,2.65c-0.61,0.25 -1.17,0.59 -1.69,0.98l-2.49,-1c-0.23,-0.09 -0.49,0 -0.61,0.22l-2,3.46c-0.13,0.22 -0.07,0.49 0.12,0.64l2.11,1.65c-0.04,0.32 -0.07,0.65 -0.07,0.98s0.03,0.66 0.07,0.98l-2.11,1.65c-0.19,0.15 -0.24,0.42 -0.12,0.64l2,3.46c0.12,0.22 0.39,0.3 0.61,0.22l2.49,-1c0.52,0.4 1.08,0.73 1.69,0.98l0.38,2.65c0.03,0.24 0.24,0.42 0.49,0.42l4,0c0.25,0 0.46,-0.18 0.49,-0.42l0.38,-2.65c0.61,-0.25 1.17,-0.59 1.69,-0.98l2.49,1c0.23,0.09 0.49,0 0.61,-0.22l2,-3.46c0.12,-0.22 0.07,-0.49 -0.12,-0.64l-2.11,-1.65zm-7.43,2.52c-1.93,0 -3.5,-1.57 -3.5,-3.5s1.57,-3.5 3.5,-3.5s3.5,1.57 3.5,3.5s-1.57,3.5 -3.5,3.5z"></path></g></svg>'
    };
  })
  .directive('svgPerson', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 23.999999999999996 23.999999999999996" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g><path stroke-width="0.5" fill="none" stroke="{{opts.color}}" d="m17.722219,4.018527zm-5.388886,8.083329c-3.597081,0 -10.777772,1.805277 -10.777772,5.388886l0,2.694443l21.555544,0l0,-2.694443c0,-3.583609 -7.18069,-5.388886 -10.777772,-5.388886z"></path><ellipse ry="4.703695" rx="4.703695" id="svg_3" cy="5.870381" cx="12.314814" stroke-width="0.5" stroke="{{opts.color}}" fill="none"></ellipse></g></svg>'
    };
  })
  .directive('svgCapabilities', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 55 55" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g transform=matrix(0.86689883,0,0,0.86689883,9.9891906,28.32753) style=stroke-width:.47342935;stroke-miterlimit:4;stroke-dasharray:none></g><g transform=matrix(1.6666667,0,0,1.6666667,0,15)><path d="M 5.9935143,-2.2957044 H 26.799086 V 18.509867 H 5.9935143 Z"inkscape:connector-curvature=0 style=fill:none;stroke-width:.2462492;stroke-miterlimit:4;stroke-dasharray:none></path><rect height=6.5369792 style=fill:none;fill-opacity:1;stroke:{{::opts.color}};stroke-width:.29999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.5369792 x=4.2006164 y=13.958521></rect><rect height=6.5644274 style=fill:none;fill-opacity:1;stroke:{{::opts.color}};stroke-width:.29999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.5644274 x=12.927996 y=13.937122></rect><rect height=6.5885091 style=fill:none;fill-opacity:1;stroke:{{::opts.color}};stroke-width:.29999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.58851 x=21.823067 y=13.919167></rect><rect height=6.5036697 style=fill:none;fill-opacity:1;stroke:{{::opts.color}};stroke-width:.29999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.5036693 x=8.6535578 y=3.8014824></rect><rect height=6.5456471 style=fill:none;fill-opacity:1;stroke:{{::opts.color}};stroke-width:.29999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.5456471 x=17.458857 y=3.7039611></rect><rect height=1.9699936 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.19978057;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=11.646369 y=10.391957></rect><rect height=2.0080833 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.13057199;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=20.521465 y=10.348427></rect><rect height=0.4924984 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.18651684;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=16.043322 x=8.2007809 y=12.35651></rect><rect height=1.6252447 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.21192409;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=7.7082825 y=12.35651></rect><rect height=1.6252447 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.19086249;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=15.977611 y=12.35651></rect><rect height=1.6252447 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.19785605;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=24.244106 y=12.35651></rect><rect height=6.7908545 style=fill:none;fill-opacity:1;stroke:none;stroke-width:.2462492;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=7.1826348 x=0.31195343 y=-3.0590537></rect><rect height=5.3107967 style=fill:none;fill-opacity:1;stroke:none;stroke-width:.2462492;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.3990746 x=13.676007 y=-4.1038008></rect><rect height=6.4919753 style=fill:none;fill-opacity:1;stroke:{{::opts.color}};stroke-width:.29999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=6.4919753 x=12.917996 y=-5.2711415></rect><rect height=0.4924984 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.27738765;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=12.312461 x=9.9724617 y=2.2450514></rect><rect height=1.4774952 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.25407732;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=15.960152 y=1.2270232></rect><rect height=0.9849968 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.26612151;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=9.9724617 y=2.7375498></rect><rect height=0.9849968 style=fill:{{::opts.color}};fill-opacity:1;stroke:none;stroke-width:.2573072;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1 width=0.4924984 x=21.792427 y=2.7375498></rect></g></svg>'
    };
  })
  .directive('svgLabour', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 55 55" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g transform=translate(0,31)></g><g transform=matrix(2.2445076,0,0,2.2445076,0.094523,1.1036506)><path d="m 15.839472,15.63302 c -0.863771,-0.345661 -1.20867,-1.295657 -1.20867,-1.295657 0,0 -0.389155,0.21518 -0.389155,-0.389155 0,-0.604335 0.389155,0.389155 0.77831,-1.94425 0,0 1.078952,-0.30293 0.863772,-2.80802 h -0.259437 c 0,0 0.647829,-2.678303 0,-3.585569 C 14.975701,4.703104 14.717027,4.098769 13.290888,3.66612 11.864749,3.233471 12.384386,3.319696 11.347402,3.363953 10.310418,3.407446 9.445883,3.968288 9.445883,4.270455 c 0,0 -0.647829,0.043494 -0.906502,0.302931 -0.259437,0.259436 -0.691323,1.468106 -0.691323,1.771037 0,0.302931 0.215943,2.333404 0.431886,2.76529 L 8.022796,9.195938 c -0.215942,2.50509 0.863772,2.80802 0.863772,2.80802 0.388392,2.333405 0.777547,1.339915 0.777547,1.94425 0,0.604335 -0.389155,0.389155 -0.389155,0.389155 0,0 -0.344898,0.949996 -1.20867,1.295657 -0.863771,0.344899 -5.658772,2.20216 -6.048691,2.591315 -0.389918,0.389918 -0.345661,2.203686 -0.345661,2.203686 h 20.561886 c 0,0 0.04502,-1.813768 -0.344898,-2.203686 -0.390681,-0.389155 -5.185682,-2.246416 -6.049454,-2.591315 z m 7.522139,0.747025 c -0.01221,-0.0046 -0.029,-0.01144 -0.03968,-0.01602 z"style=fill:none;stroke:{{::opts.color}};stroke-width:.22276601;stroke-miterlimit:4;stroke-dasharray:none></path><path d="M 6.117505,16.440779 C 6.056051,16.329043 6.025634,16.248345 6.025634,16.248345 c 0,0 -0.268166,0.14836 -0.268166,-0.268165 0,-0.416525 0.268166,0.268165 0.536331,-1.340207 0,0 0.744284,-0.208573 0.595303,-1.93613 H 6.710325 c 0,0 0.088767,-0.366865 0.147118,-0.828085 -0.00248,-0.191192 0.00373,-0.394799 0.022968,-0.61827 L 6.904,10.993047 C 6.890964,10.687636 6.837579,10.41016 6.710325,10.232003 6.263382,9.606905 6.084605,9.189758 5.101953,8.891797 4.1193,8.593835 4.476233,8.652807 3.761746,8.683224 3.046638,8.71302 2.450715,9.099749 2.450715,9.308943 c 0,0 -0.446943,0.029796 -0.62572,0.208573 -0.168224,0.168224 -0.437631,0.907542 -0.46991,1.17012 v 0.174432 c 0.029176,0.405352 0.160155,1.520225 0.291133,1.782804 l -0.177535,0.05959 c -0.14836,1.727557 0.595303,1.93613 0.595303,1.93613 0.268165,1.608372 0.53633,0.923681 0.53633,1.340207 0,0.416526 -0.268165,0.268165 -0.268165,0.268165 0,0 -0.237749,0.656136 -0.833672,0.893264 -0.037866,0.0149 -0.086285,0.03476 -0.144015,0.05711 v 3.249023 H 1.711398 C 1.693396,19.65504 1.759196,18.631418 2.17448,18.217375 2.395468,17.997008 3.119887,17.634488 6.117505,16.440779 Z"style=fill:none;stroke:{{::opts.color}};stroke-width:.22276601;stroke-miterlimit:4;stroke-dasharray:none transform=rotate(0.5979473,4.1316404,14.552807)></path><path d="m 17.847969,16.384314 c 0.06184,-0.111736 0.09245,-0.192434 0.09245,-0.192434 0,0 0.269852,0.14836 0.269852,-0.268165 0,-0.416525 -0.269852,0.268165 -0.539703,-1.340207 0,0 -0.748963,-0.208573 -0.599046,-1.93613 h 0.179901 c 0,0 -0.08933,-0.366865 -0.148043,-0.828085 0.0025,-0.191192 -0.0037,-0.394799 -0.02311,-0.61827 l -0.02374,-0.264441 c 0.01312,-0.305411 0.06684,-0.582887 0.194893,-0.761044 0.449753,-0.625098 0.629654,-1.042245 1.618484,-1.340206 0.988831,-0.297962 0.629654,-0.23899 1.348633,-0.208573 0.719604,0.029796 1.319273,0.416525 1.319273,0.625719 0,0 0.449753,0.029796 0.629654,0.208573 0.169282,0.168224 0.440382,0.907542 0.472864,1.17012 v 0.174432 c -0.02936,0.405352 -0.161162,1.520225 -0.292963,1.782804 l 0.178651,0.05959 c 0.149293,1.727557 -0.599046,1.93613 -0.599046,1.93613 -0.269851,1.608372 -0.539702,0.923681 -0.539702,1.340207 0,0.416526 0.269851,0.268165 0.269851,0.268165 0,0 0.239244,0.656136 0.838913,0.893264 0.0381,0.0149 0.08683,0.03476 0.14492,0.05711 v 3.249023 h -0.359178 c 0.01811,-0.793323 -0.0481,-1.816945 -0.465993,-2.230988 -0.222377,-0.220367 -0.951351,-0.582887 -3.967815,-1.776596 z"style=fill:none;stroke:{{::opts.color}};stroke-width:.22276601;stroke-miterlimit:4;stroke-dasharray:none transform=rotate(0.5979473,19.846319,14.496341)></path></g></svg>'
    };
  })
  .directive('svgContracts', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 35 55" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><g transform=matrix(1.3320814,0,0,1.3320814,0.33208141,22.697965)><rect height=26 style=fill:none width=26 x=-1 y=-1 id=canvas_background></rect></g><g transform=translate(0,31)><path d="m 32.410952,4.0277972 c -0.03147,-0.047358 -0.07055,-0.093771 -0.12034,-0.1293811 -0.213079,-0.1552536 -0.513772,-0.1079146 -0.669985,0.1063874 -0.15595,0.2148008 -0.106666,0.5150309 0.106908,0.6707308 0.19405,0.1406074 0.453004,0.1068899 0.618237,-0.058528 L 27.811864,10.867209 26.402333,15.983499 30.82789,13.055106 40.906421,-0.83860083 37.889178,-3.026935 36.91655,-1.6859865 C 36.8609,-1.909055 36.736681,-2.1184902 36.535314,-2.2659214 36.068142,-2.6046584 35.415015,-2.5021891 35.076485,-2.0340793 33.136584,0.64201881 34.211983,1.354665 32.41095,4.0277914 v 0 z m -2.219611,8.3653658 -2.276473,1.506436 0.724901,-2.634034 z m 2.681651,-8.5015525 c 1.396581,-2.0633899 1.263554,-2.622875 2.458788,-4.4543429 0.197714,0.13568025 0.424698,0.18354125 0.647528,0.17179336 L 32.872992,3.8916068 Z"fill-opacity=null inkscape:connector-curvature=0 stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none></path><line fill-opacity=null stroke-linecap=null stroke-linejoin=null stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none x1=3.0510175 x2=32.264866 y1=-18.653954 y2=-18.653954></line><line fill-opacity=null stroke-linecap=null stroke-linejoin=null stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none x1=3.2336459 x2=3.2336459 y1=-18.98464 y2=20.647528></line><line fill-opacity=null stroke-linecap=null stroke-linejoin=null stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none x1=32.401249 x2=32.401249 y1=-18.999998 y2=3.8521547></line><line fill-opacity=null stroke-linecap=null stroke-linejoin=null stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none x1=3.0510175 x2=32.403809 y1=20.84491 y2=20.84491></line><line fill-opacity=null stroke-linecap=null stroke-linejoin=null stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none x1=32.401264 x2=32.401264 y1=10.895915 y2=21.064041></line><rect height=2.9234095 style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none width=21.95475 x=6.6307874 y=-14.655736 fill-opacity=null stroke-opacity=null></rect><rect height=3.1263947 style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none width=16.703043 x=6.4757252 y=-0.52168369 fill-opacity=null stroke-opacity=null></rect><line fill-opacity=null stroke-linecap=null stroke-linejoin=null stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none x1=25.50695 x2=10.86148 y1=17.211885 y2=17.211885></line><rect height=3.0767803 style=fill:none;stroke:{{::opts.color}};stroke-width:.5;stroke-miterlimit:4;stroke-dasharray:none width=19.814459 x=6.5162625 y=-5.9578605 fill-opacity=null stroke-opacity=null></rect></g></svg>'
    };
  })
  .directive('svgRecoveries', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"></g><g><path d="m17.42218,10.39089c0.79765,0.00101 1.55966,0.14017 2.28132,0.37265l-0.57114,0.99531l4.05419,0l-1.01381,-1.76909l-1.01303,-1.76857l-0.53327,0.93192c-0.99943,-0.36817 -2.07685,-0.57421 -3.20354,-0.57421c-5.18605,0 -9.3895,4.23562 -9.3895,9.46102c0,2.16872 0.73205,4.16128 1.95035,5.75774l1.42772,-1.10452c-0.98532,-1.29016 -1.57776,-2.90009 -1.58097,-4.65269c0.00718,-4.22467 3.39936,-7.64309 7.59167,-7.64956l0.00001,0z" fill=none stroke={{::opts.color}} stroke-width=0.4 transform="rotate(-173.17637634277344 15.609974861145021,16.00942611694336) "/><path d="m1.955455,3.97641c5.518934,-5.96948 11.037867,5.969479 16.5568,0l0,10.745062c-5.518933,5.96948 -11.037866,-5.969479 -16.5568,0l0,-10.745062z" fill=none stroke={{::opts.color}} stroke-width=0.4 fill-opacity=null stroke-opacity=null /><ellipse cx=10.233542 cy=9.440133 fill=none fill-opacity=null rx=2.829327 ry=2.829327 stroke={{::opts.color}} stroke-opacity=null stroke-width=0.4 /></g></svg>'
    };
  })
  .directive('svgResourceStack', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns=http://www.w3.org/2000/svg><g transform="translate(0,21)"><rect height="26" style="fill:none" width="26" x="-1" y="-1"></rect></g><g transform="matrix(1.9523394,0,0,1.9523394,-2.2622274,-2.6460952)"><path d="m 17.33871,12.053637 c 0.745161,0 1.348065,-0.581674 1.348065,-1.292609 l 0.0068,-6.463043 c 0,-0.710935 -0.609677,-1.292609 -1.354839,-1.292609 H 6.500025 c -0.745161,0 -1.354839,0.581674 -1.354839,1.292609 v 6.463043 c 0,0.710935 0.609677,1.292609 1.354839,1.292609 H 3.790347 v 1.292609 H 20.048413 V 12.053637 H 17.338735 Z M 6.499999,4.297985 H 17.33871 v 6.463043 H 6.499999 Z" inkscape:connector-curvature="0" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></path><rect height="3.0645161" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" width="19.112898" x="2.470433" y="19.569887" fill-opacity="null" stroke-opacity="null"></rect><circle cx="19.728493" cy="21.102144" fill-opacity="null" r="1.075268" stroke-opacity="null" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></circle><rect height="3.0645161" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" width="19.112898" x="2.470433" y="16.478491" fill-opacity="null" stroke-opacity="null"></rect><circle cx="19.728493" cy="18.010748" fill-opacity="null" r="1.075268" stroke-opacity="null" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></circle><rect height="3.0645161" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" width="19.112898" x="2.470433" y="13.387092" fill-opacity="null" stroke-opacity="null"></rect><circle cx="19.728493" cy="14.91935" fill-opacity="null" r="1.075268" stroke-opacity="null" style="fill:none;stroke:{{::opts.color}};stroke-width:.34700799;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></circle></g></svg>'
    };
  })
  .directive('svgInfrastructure', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 55 55" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns=http://www.w3.org/2000/svg><g transform=matrix(1.0561238,0,0,1.0561238,6.0561238,23.596906) style=stroke-width:.47342935;stroke-miterlimit:4;stroke-dasharray:none><rect height=26 style=fill:none;stroke-width:.47342935;stroke-miterlimit:4;stroke-dasharray:none width=26 x=-1 y=-1 /></g><g transform=matrix(1.6666667,0,0,1.6666667,0,15)><path d="M 3.6336742,-4.9806448 H 28.980645 V 20.366326 H 3.6336742 Z"inkscape:connector-curvature=0 style=fill:none;stroke-width:.29999999;stroke-miterlimit:4;stroke-dasharray:none /><path d="m 21.364297,-1.1227267 -3.266443,3.2950829 v 2.6195915 c 0.947268,0.345983 1.633222,1.2521304 1.633222,2.3230323 0,1.36746 -1.094258,2.471313 -2.449832,2.471313 -1.355574,0 -2.449833,-1.103853 -2.449833,-2.471313 0,-1.0709019 0.685954,-1.9770493 1.633222,-2.3230323 V 2.1723562 L 13.198191,-1.1227267 H 9.9317481 v -4.1188547 h 4.0830529 v 2.5125006 l 3.266443,3.45983862 3.266443,-3.45983862 v -2.5125006 h 4.083052 v 4.1188547 z"inkscape:connector-curvature=0 style=fill:none;stroke:{{::opts.color}};stroke-width:.29999999;stroke-miterlimit:4;stroke-dasharray:none /><path d="m 13.172097,15.39808 3.266437,-3.295084 1e-6,-2.619594 C 15.491266,9.13742 14.805314,8.231273 14.805314,7.160371 c -2e-6,-1.3674592 1.094257,-2.4713117 2.449833,-2.4713106 1.355575,9e-7 2.449832,1.1038525 2.449832,2.4713116 -1e-6,1.070903 -0.685953,1.977053 -1.633221,2.323033 l 1e-6,2.619594 3.266446,3.295078 h 3.266442 l -1e-6,4.118854 -4.083053,2e-6 1e-6,-2.512502 -3.266442,-3.459838 -3.266445,3.459836 1e-6,2.512503 -4.0830509,-3e-6 -3e-7,-4.118852 z"inkscape:connector-curvature=0 style=fill:none;stroke:{{::opts.color}};stroke-width:.29999999;stroke-miterlimit:4;stroke-dasharray:none /><path d="M 25.534854,11.269497 22.239771,8.003054 h -2.61959 c -0.345983,0.947268 -1.252131,1.633221 -2.323034,1.633221 -1.36746,0 -2.471314,-1.094258 -2.471312,-2.449834 0,-1.3555732 1.103853,-2.449833 2.471311,-2.4498338 1.070903,-3e-7 1.977051,0.6859534 2.323034,1.6332217 l 2.61959,3.2e-6 3.295083,-3.2664422 1e-6,-3.26644148 4.118855,2e-7 V 3.9199999 h -2.5125 l -3.45984,3.2664421 3.45984,3.266443 2.5125,10e-7 v 4.083051 l -4.118856,10e-7 z"inkscape:connector-curvature=0 style=fill:none;stroke:{{::opts.color}};stroke-width:.29999999;stroke-miterlimit:4;stroke-dasharray:none /><path d="m 9.0140468,3.0772975 3.2950842,3.2664357 h 2.619596 c 0.34598,-0.9472683 1.252127,-1.6332208 2.323028,-1.6332205 1.367461,-1.1e-6 2.471312,1.0942573 2.471311,2.4498333 -1e-6,1.355576 -1.103852,2.449833 -2.471311,2.449832 -1.070903,-2e-6 -1.977054,-0.685954 -2.323033,-1.633219 l -2.619595,-1e-6 -3.295076,3.266445 -1.1e-6,3.266443 H 4.8951947 l -2.1e-6,-4.083055 2.5125026,4e-6 3.4598378,-3.266444 -3.4598357,-3.2664448 -2.5125026,1.4e-6 3.1e-6,-4.08305018 4.1188521,-3e-7 z"inkscape:connector-curvature=0 style=fill:none;stroke:{{::opts.color}};stroke-width:.29999999;stroke-miterlimit:4;stroke-dasharray:none /></g></svg>'
    };
  })
  .directive('svgService', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 55 55" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns=http://www.w3.org/2000/svg><g transform=translate(0,31)><rect height=26 id=canvas_background style=fill:none width=26 x=-1 y=-1></rect></g><g transform=matrix(1.968804,0,0,1.968804,5.5211869,2.2065891)><path d="M 14.326817,10.617494 C 15.654151,9.091413 15.920953,7.008838 15.198885,5.257407 L 12.534151,8.364855 9.907378,7.854147 9.037,5.323813 11.694995,2.223582 C 9.86667,1.763601 7.852413,2.318921 6.530926,3.838963 5.137253,5.441458 4.909177,7.660602 5.771788,9.461063 l -6.945869,7.987453 c -0.739075,0.849206 -0.649037,2.137195 0.200175,2.875982 0.849212,0.738266 2.136943,0.649037 2.875762,-0.200179 l 6.937732,-7.979573 c 1.909751,0.615544 4.087109,0.08253 5.48723,-1.527252 l -10e-7,-1e-6 z"fill-opacity=null inkscape:connector-curvature=0 stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.25396129;stroke-miterlimit:4;stroke-dasharray:none transform=rotate(-40.442711,6.958169,11.445674)></path><path d="M 16.957482,17.099841 16.584839,15.79559 c 0.109206,-0.0958 0.211707,-0.198296 0.30846,-0.307981 l 1.303293,0.372643 c 0.137466,-0.200212 0.255773,-0.412877 0.361627,-0.633685 l -0.969926,-0.938792 c 0.04646,-0.137945 0.08669,-0.278285 0.115433,-0.422935 l 1.307124,-0.327619 c 0.0096,-0.120702 0.01868,-0.241883 0.01868,-0.365458 0,-0.123575 -0.0096,-0.244278 -0.01868,-0.364979 l -1.307124,-0.327619 c -0.02922,-0.144651 -0.06945,-0.28499 -0.115433,-0.422935 l 0.970405,-0.938792 c -0.106333,-0.220329 -0.22464,-0.433473 -0.362106,-0.633685 l -1.303293,0.372164 c -0.09627,-0.109206 -0.199254,-0.211707 -0.30846,-0.307981 L 16.957482,9.244164 C 16.75727,9.107177 16.544126,8.988391 16.323318,8.882537 L 15.384526,9.852942 C 15.24706,9.806481 15.106241,9.766726 14.961591,9.737509 l -0.32714,-1.307603 c -0.121181,-0.0091 -0.241883,-0.01868 -0.365458,-0.01868 -0.123575,0 -0.244278,0.00958 -0.364979,0.01868 L 13.576395,9.737509 C 13.431744,9.766727 13.291405,9.806481 13.15346,9.852942 L 12.214668,8.882537 c -0.220329,0.107291 -0.432994,0.225598 -0.633206,0.363064 l 0.372643,1.303772 c -0.109206,0.0958 -0.212186,0.198775 -0.307981,0.307502 l -1.303772,-0.372643 c -0.137466,0.200212 -0.255773,0.413356 -0.361627,0.634164 l 0.970405,0.938792 c -0.04598,0.137945 -0.08622,0.278285 -0.115433,0.422935 l -1.307603,0.327619 c -0.0091,0.120702 -0.01868,0.241883 -0.01868,0.364979 0,0.123096 0.00958,0.244278 0.01868,0.365458 l 1.307603,0.327619 c 0.02922,0.144651 0.06945,0.28499 0.115433,0.422935 l -0.970405,0.938792 c 0.105854,0.220329 0.224161,0.433473 0.361627,0.633685 l 1.303772,-0.372643 c 0.09579,0.109685 0.198775,0.211707 0.307981,0.307981 l -0.372643,1.304251 c 0.200212,0.136987 0.413356,0.255294 0.633685,0.361627 l 0.938792,-0.970405 c 0.137945,0.04646 0.278285,0.08669 0.422935,0.115433 l 0.327619,1.307124 c 0.120702,0.0096 0.241883,0.01868 0.365458,0.01868 0.123575,0 0.244278,-0.0096 0.365458,-0.01868 l 0.32714,-1.307124 c 0.144651,-0.02922 0.285469,-0.06945 0.422935,-0.115433 l 0.938792,0.970405 c 0.21985,-0.107291 0.432994,-0.225598 0.633206,-0.362585 z m -2.688011,-2.299562 c -0.899037,0 -1.628038,-0.729001 -1.628038,-1.628038 0,-0.899037 0.729001,-1.627559 1.628038,-1.627559 0.899037,0 1.627559,0.728522 1.627559,1.627559 0,0.899037 -0.728522,1.628038 -1.627559,1.628038 z m 7.42029,3.403122 c 0.0091,-0.262 -0.02874,-0.528789 -0.110164,-0.792226 l 0.595846,-0.849224 C 22.085396,16.39431 21.983853,16.23529 21.86842,16.090639 l -1.016386,0.213144 c -0.205002,-0.174347 -0.438263,-0.310376 -0.687809,-0.407608 l -0.292654,-0.99579 c -0.184885,-0.03257 -0.372164,-0.05029 -0.561838,-0.05077 l -0.466522,0.927297 c -0.133634,0.02586 -0.267268,0.06131 -0.398508,0.111601 -0.123097,0.04694 -0.238051,0.105375 -0.348215,0.169078 L 17.135663,15.66531 c -0.142256,0.125492 -0.272058,0.261042 -0.389407,0.408087 l 0.434431,0.942624 c -0.124055,0.237093 -0.209312,0.492387 -0.248588,0.759176 l -0.905743,0.507714 c 0.0091,0.185843 0.0364,0.371685 0.07855,0.558007 l 1.007765,0.248588 c 0.110643,0.250983 0.259126,0.475623 0.438742,0.667213 l -0.168599,1.02405 c 0.153272,0.110164 0.316124,0.205002 0.485202,0.287385 l 0.821443,-0.632248 c 0.256731,0.06754 0.525436,0.0934 0.796057,0.07185 l 0.695473,0.769714 c 0.0958,-0.0273 0.191111,-0.05652 0.285469,-0.09244 0.08382,-0.03161 0.162852,-0.06897 0.241883,-0.106812 l 0.01772,-1.036982 c 0.217934,-0.162373 0.403776,-0.357795 0.55178,-0.577645 l 1.035066,-0.06418 c 0.0728,-0.171952 0.133634,-0.35061 0.176263,-0.534058 l -0.79941,-0.661944 z m -1.993975,0.961304 c -0.57525,0.219371 -1.218993,-0.06897 -1.438843,-0.644222 -0.21985,-0.57525 0.06849,-1.219472 0.643743,-1.439322 0.57525,-0.219371 1.219951,0.06897 1.439801,0.644222 0.219371,0.57525 -0.06945,1.219472 -0.644701,1.439322 z"fill-opacity=null inkscape:connector-curvature=0 stroke-opacity=null style=fill:none;stroke:{{::opts.color}};stroke-width:.25396129;stroke-miterlimit:4;stroke-dasharray:none transform=rotate(-122.19141,15.999291,14.844346)></path></g></svg>'
    };
  })
  .directive('svgLedger', () => {
    return {
      scope: {
        opts: '='
      },
      template:
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100" data-ng-attr-width="{{opts.width || 24}}" data-ng-attr-height="{{opts.height || 24}}" xmlns="http://www.w3.org/2000/svg"><style>.st0{fill-opacity:0;stroke:{{::opts.color}};stroke-width:.5}.st1{fill:none;stroke:{{::opts.color}};stroke-width:.5}</style><g><path class=st0 d="M49.5,31.6l-0.1,49.1c0-5.4-8.8-9.8-19.6-9.8   c-10.8,0-19.6,4.4-19.6,9.8l0.1-49.1l0,0c0-5.4,8.8-9.8,19.6-9.8C40.8,21.7,49.6,26.1,49.5,31.6z"></path></g><path class=st1 d=M10.3,36H2.9v43.9c0,6.6,2.4,9,9,9h75.2c6.6,0,9-2.4,9-9V36H89></path><g><path class=st0 d="M88.9,31.6l-0.1,49.1c0-5.4-8.8-9.8-19.6-9.8   c-10.8,0-19.6,4.4-19.6,9.8l0.1-49.1l0,0c0-5.4,8.8-9.8,19.6-9.8C80.2,21.7,88.9,26.1,88.9,31.6z"inkscape:connector-curvature=0></path></g></svg>'
    };
  });
