/**
 * Created by Sergiu Ghenciu on 13/03/2018
 *
 * Expected data structure: [{value: 10}, {value: 20}, ...]
 *
 */

'use strict';
angular
  .module('components.d3.rows-service', [
    'utils.misc',
    'utils.chart-data-format',
  ])
  .factory('rowsService', [
    'misc',
    'chartDataFormat',
    function(_, chartDataFormat) {
      const render = (element, data, opts) => {
        const color = _.scaleOrdinal(opts.colors);
        const total = data.reduce((a, e) => a + e.value, 0);
        const total2 = data.reduce(
          (a, e) => (e.isNegative ? _.subtract(e.value, a) : _.add(e.value, a)),
          0
        );
        console.log('\n\n\n\n');
        console.log('data....', data);
        console.log('opts.colors', opts.colors);
        console.log('color', color);
        console.log('total', total);
        console.log('total2', total2);
        console.log('\n\n\n\n');
        /* diagram */
        const chart = document.createElement('div');
        chart.style.height = 'calc(100% - 40px)';
        chart.style.whiteSpace = 'nowrap';

        const bars = data.map(function(e, i) {
          const bar = document.createElement('div');
          const width = Math.abs(e.value) / total * 100;

          console.log('\n\n\n\n');
          console.log('segments widths', width);

          bar.style.backgroundColor = color(i);
          bar.style.width = width + '%';
          bar.className = width < 5 ? 'bar too-small' : 'bar';

          const span = document.createElement('span');
          span.innerText = chartDataFormat.formatPercentage(
            _.percentage(e.value, total2),
            e.isNegative
          );

          bar.appendChild(span);
          chart.appendChild(bar);

          return bar;
        });

        /* axis */
        const axis = document.createElement('div');
        axis.className = 'axis x';
        const ticks = 10;
        const interval = total / ticks;
        let val = 0;
        for (let i = 0; i < ticks; i++) {
          const span = document.createElement('span');
          span.style.width = 100 / ticks + '%';
          val += interval;
          span.innerText = chartDataFormat.kFormatter(val);
          axis.appendChild(span);
        }

        /* end append chart to DOM */
        element.appendChild(chart);
        element.appendChild(axis);

        // make it compatible with d3
        bars.each = (fn) => {
          bars.forEach((e, i) => {
            fn(data[i], i, bars);
          });
        };

        return bars;
      };

      return {
        render: render,
      };
    },
  ]);
