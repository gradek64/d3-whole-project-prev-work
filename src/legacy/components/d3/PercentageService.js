/**
 * Created by Sergiu Ghenciu on 13/07/2017.
 */


/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('PercentageService', ['TooltipService', 'ChartDataFormat',
  function(TooltipService, ChartDataFormat) {
    'use strict';
    return function(){

      function noData(element) {
        var h1 = document.createElement('h1');
        h1.style = 'text-align: center; color: #ccc; margin-top:90px;';
        h1.innerText = 'No data';
        element[0].appendChild(h1);
      }

      function sortByPercentage(a, b) {
        return  a.percentage - b.percentage;
      }

      function init(scope, element) {}

      function resize(scope, element) {}

      function render(scope, element) {

        if (!scope.info.data || scope.info.data.length === 0) {
          return noData(element);
        }

        var container = element.closest('.chart');

        var negative = scope.info.data
        .filter(function(e){return e.percentage < 0;})
        .sort(sortByPercentage);

        var positive = scope.info.data
        .filter(function(e){return e.percentage >= 0;})
        .sort(sortByPercentage);

        var sortedData = negative.concat(positive);

        var total = scope.info.data.reduce(function(a, e){ return a + Math.abs(e.percentage);}, 0);

        // this doesn't seem to work with small numbers of data points
        var colorRed = d3.scaleLinear().domain([0, sortedData.length - 1])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#FFCDD2"), d3.rgb('#C62828')]);

        var colorGreen = d3.scaleLinear().domain([0, sortedData.length - 1])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#C8E6C9"), d3.rgb('#2E7D32')]);


        /* actual render */
        var chart = document.createElement('div');
        chart.style.height = 'calc(100% - 40px)';

        sortedData.forEach(function (e, i) {
          var bar = document.createElement('div');
          bar.className = 'bar';
          bar.style.width = Math.abs(e.percentage) / total * 100 + "%";
          bar.style.backgroundColor = e.percentage < 0 ? colorGreen(i) : colorRed(i);

          var p = ChartDataFormat.formatPercentage(e.percentage);
          var span = document.createElement('span');
          span.innerText = e.percentage < 0 ? "(" + p + "%)" : p + "%";

          bar.appendChild(span);
          chart.appendChild(bar);

          bar.onclick = function () {
            scope.info.onClick(e, i);
          };

          var text = ChartDataFormat.formatWaterfallTooltipText(e);
          bar.onmousemove = function (event) {
            TooltipService.showTooltip(container, text, event);
          };

          bar.onmouseout = function () {
            TooltipService.hideTooltip(container);
          };
        });


        // axis
        var width = negative
        .reduce(function (a, e) {
          return a + Math.abs(e.percentage);
        }, 0);

        var axis = document.createElement('div');
        axis.className = 'axis';

        axis.innerHTML = '<div style="width:' + (Math.abs(width) / total * 100) + '%"><span>–</span></div>' +
            '<div><span>+</span></div>';

        // chart.appendChild(axis);

        /* end append chart to DOM */
        element[0].appendChild(chart);
        element[0].appendChild(axis);
      }



      return {
        type: "percentage",
        init: init,
        render: render,
        resize: resize
      };
    };
  }]);
