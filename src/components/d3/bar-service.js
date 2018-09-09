/**
 * Created by Sergiu Ghenciu on 07/03/2018
 *
 * Expected data structure: [{label: 'A', value: 10}, {label: 'B', value: 20}]
 *
 */

'use strict';

angular
  .module('components.d3.bar-service', [
    'utils.misc',
    'utils.chart-data-format',
  ])
  .factory('barService', [
    'misc',
    'chartDataFormat',
    function(_, chartDataFormat) {
      const render = (element, data, opts) => {
        const color = _.scaleOrdinal(opts.colors);
        // set the dimensions and margins of the graph
        const margin = {top: 5, right: 0, bottom: 20, left: 50};
        const width = opts.width - margin.left - margin.right;
        const height = opts.height - margin.top - margin.bottom;
        const label = 'label';
        const value = 'value';

        // set the ranges
        const x = d3
          .scaleBand()
          .range([0, width])
          .padding(0.1);
        const y = d3.scaleLinear().range([height, 0]);

        // Scale the range of the data in the domains
        x.domain(data.map((d, i) => i));
        y.domain([0, d3.max(data.map(_.prop(value)))]);

        // const minSize = Math.min(opts.width, opts.height);

        const svg = d3
          .select(element)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', '0 0 ' + opts.width + ' ' + opts.height)
          .attr('preserveAspectRatio', 'xMidYMin')
          .append('g')
          .attr(
            'transform',
            'translate(' + margin.left + ',' + margin.top + ')'
          );

        // add the y Axis
        // const yAxis = svg
        //   .append('g')
        //   .attr('class', 'axis y')
        //   .call(d3.axisLeft(y));
        const yAxis = svg
          .append('g')
          .attr('class', 'axis y')
          .call(
            d3
              .axisLeft(y)
              .ticks(5)
              .tickFormat((d, i, a) => {
                // console.log(d, i);
                return chartDataFormat.kFormatter(d, false, '£');
              })
              .tickSizeInner(-width)
              .tickSizeOuter(0)
              .tickPadding(5)
          );
        if (opts.yLabel) {
          yAxis
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left - 5)
            .attr('x', 5)
            .attr('text-anchor', 'end')
            .attr('fill', '#5D6971')
            .text(opts.yLabel);
        }

        /*
        * !!! The legend could be altered from legend service
        */
        // add the x Axis
        if (opts.legend) {
          const xAxis = svg
            .append('g')
            // .attr('style', 'display:none;')
            .attr('class', 'axis x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x).tickFormat((d, i) => data[i][label]));

          const shouldRotate = data.length > 3;
          if (shouldRotate) {
            xAxis
              .selectAll('text')
              .attr('transform', 'rotate(-45)')
              .attr('dy', '0')
              .attr('dx', function(d, i, a) {
                const textWidth = a[i].getComputedTextLength();
                return -textWidth - 9;
              })
              .attr('text-anchor', 'start');
          }
        }

        // append the rectangles for the bar chart
        const bars = svg
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('fill', (d, i) => color(i))
          .attr('x', function(d, i) {
            return x(i);
          })
          .attr('width', x.bandwidth())
          .attr('y', function(d) {
            return y(d[value]);
          })
          .attr('height', function(d) {
            return height - y(d[value]);
          });

        return bars;
      };

      return {
        render,
      };
    },
  ]);
