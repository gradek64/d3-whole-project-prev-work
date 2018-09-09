/**
 * Created by Sergiu Ghenciu on 13/07/2017.
 */

'use strict';

angular
  .module('components.d3.percentage-service', [
    'utils.misc',
    'utils.chart-data-format',
  ])
  .factory('percentageService', [
    'misc',
    'chartDataFormat',
    function(_, chartDataFormat) {
      const percentage = _.prop('percentage');

      const ascendPercentage = _.ascend(percentage);

      const lt0 = _.lt(0);

      const percentageListBy = (pred, data) =>
        _.pipe(_.filter(_.pipe(percentage, pred)), _.map(percentage))(data);

      const render = (element, data, opts) => {
        // console.log('data', data);
        // const percentageList = _.pluck('percentage', data);
        //
        // const negative = _.filter(_.lt(0), percentageList);
        //
        // const positive = _.filter(_.gte(0), percentageList);

        const negative = percentageListBy(lt0, data);

        const positive = percentageListBy(_.gte(0), data);

        const sortedData = _.sortBy(ascendPercentage, data);

        const negativeAbsSum = _.abs(_.sum(negative));

        const total = _.add(_.sum(positive), negativeAbsSum);

        const redOpacity = _.pipe(
          _.domain(0, _.maxAll(positive)),
          _.coDomain(0.5, 1)
        );

        const greenOpacity = _.pipe(
          _.domain(_.minAll(negative), 0),
          _.coDomain(1, 0.5)
        );

        // 173, 73, 74
        const red = (i) => 'rgba(198, 40, 40, ' + redOpacity(i) + ')';

        // 99, 121, 57
        const green = (i) => 'rgba(46, 125, 50, ' + greenOpacity(i) + ')';

        /* actual render */
        const chart = document.createElement('div');
        chart.style.height = 'calc(100% - 40px)';
        chart.style.whiteSpace = 'nowrap';

        const bars = sortedData.map(function(e, i) {
          const bar = document.createElement('div');
          const width = _.percentage(_.abs(percentage(e)), total);
          bar.className = width < 8 ? 'bar too-small' : 'bar';
          bar.style.width = width + '%';
          bar.style.backgroundColor = lt0(percentage(e))
            ? green(percentage(e))
            : red(percentage(e));

          const span = document.createElement('span');
          span.innerText = chartDataFormat.formatPercentage(
            percentage(e),
            lt0(percentage(e))
          );

          bar.appendChild(span);
          chart.appendChild(bar);

          return bar;
        });

        // axis
        let axis = document.createElement('div');
        axis.className = 'axis';

        axis.innerHTML =
          '<div style="width:' +
          _.percentage(negativeAbsSum, total) +
          '%"><span>–</span></div>' +
          '<div><span>+</span></div>';

        // chart.appendChild(axis);

        /* end append chart to DOM */
        element.appendChild(chart);
        element.appendChild(axis);

        // make it compatible with d3
        bars.each = (fn) => {
          bars.forEach((e, i) => {
            fn(sortedData[i], i, bars);
          });
        };
        return bars;
      };

      return {
        render,
      };
    },
  ]);
