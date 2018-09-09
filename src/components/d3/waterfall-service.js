/**
 * Created by Sergiu Ghenciu on 03/04/2018
 */

'use strict';
/* eslint-disable */
angular
  .module('components.d3.waterfall-service', [
    'utils.misc',
    'utils.chart-data-format'
  ])
  .factory('waterfallService', [
    'misc',
    'chartDataFormat',
    function(_, chartDataFormat) {
      const propReportId = _.prop('reportId');

      const labelMap1 = {
        400: 'Primary'
      };
      const labelMap2 = {
        400: 'Projected'
      };

      const getLabel1 = opts =>
        _.defaultTo('Primary', labelMap1[propReportId(opts)]);

      const getLabel2 = opts =>
        _.defaultTo('Secondary', labelMap2[propReportId(opts)]);

      const render = (element, data0, opts) => {
        // console.log('data0', data0, opts);
        let primaryTotal = data0.reduce(function(a, e) {
          return a + e.table1;
        }, 0);

        let data = data0.map(function(e) {
          return {
            id: e.id,
            label: e.label,
            value: e.costVariance,
            percentage: e.costVariance * 100 / primaryTotal
          };
        });

        data.unshift({ label: getLabel1(opts), value: primaryTotal });

        // var data = [
        //   {label: 'Primary', value: 300},
        //   {label: 'Staff', value: 50},
        //   {label: 'Contracts', value: 200},
        //   {label: 'Other', value: -50},
        //   {label: 'Other2', value: -30},
        //   {label: 'Other3', value: -50},
        //   {label: 'Other4', value: -50},
        //   {label: 'Other5', value: -50},
        // ];

        // Transform data (i.e., finding cumulative values and total) for easier charting
        let cumulative = 0;
        for (let i = 0; i < data.length; i++) {
          data[i].start = cumulative;
          cumulative += data[i].value;
          data[i].end = cumulative;

          data[i].class = data[i].value < 0 ? 'negative' : 'positive';
        }
        data.push({
          label: getLabel2(opts),
          value: cumulative,
          end: cumulative,
          start: 0,
          class: 'total'
        });
        data[0].class = 'total';
        // END Transform data

        let margin = { top: 20, right: 0, bottom: 30, left: 60 };
        let padding = 0.3;

        let svg = d3
          .select(element)
          .append('svg')
          .attr('preserveAspectRatio', 'none')
          .style('width', '100%')
          .style('height', '100%');

        svg.attr('viewBox', '0 0 ' + opts.width + ' ' + opts.height);

        let width = opts.width - margin.left - margin.right;
        let height = opts.height - margin.top - margin.bottom;

        let x = d3
            .scaleBand()
            .rangeRound([0, width])
            .padding(padding),
          y = d3.scaleLinear().rangeRound([height, 0]);

        let xAxis = d3.axisBottom(x),
          yAxis = d3.axisLeft(y).tickFormat(function(d) {
            return chartDataFormat.kFormatter(d, '£');
          });

        let chart = svg
          .append('g')
          .attr(
            'transform',
            'translate(' + margin.left + ',' + margin.top + ')'
          );

        x.domain(
          data.map(function(d) {
            return d.label;
          })
        );
        y.domain([
          0,
          d3.max(data, function(d) {
            return d.end;
          })
        ]);

        chart
          .append('g')
          .attr('class', 'axis x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        chart
          .append('g')
          .attr('class', 'axis y')
          .call(yAxis);

        let bar = chart
          .selectAll('.bar')
          .data(data)
          .enter()
          .append('g')
          .attr('class', function(d) {
            return (
              'bar ' +
              d.class +
              (Math.abs(y(d.start) - y(d.end)) < 28 ? ' too-small' : '')
            );
          })
          .attr('transform', function(d) {
            return 'translate(' + x(d.label) + ',0)';
          });

        bar
          .append('rect')
          .attr('y', function(d) {
            return y(Math.max(d.start, d.end));
          })
          .attr('height', function(d) {
            return Math.abs(y(d.start) - y(d.end));
          })
          .attr('width', x.bandwidth());

        bar
          .append('text')
          .attr('x', x.bandwidth() / 2)
          .attr('y', function(d) {
            return d.class === 'negative' ? y(d.start) : y(d.end);
          })
          .attr('dy', function() {
            return '1.5em';
          })
          .text(function(d) {
            return chartDataFormat.kFormatter(d.end - d.start, '£');
          });

        bar
          .filter(function(d) {
            return d.percentage !== undefined;
          })
          .append('text')
          .attr('x', x.bandwidth() / 2)
          .attr('y', function(d) {
            return d.class === 'negative' ? y(d.start) : y(d.end);
          })
          .attr('dy', function() {
            return '-0.50em';
          })
          .attr('class', 'percentage')
          .text(function(d) {
            return chartDataFormat.formatPercentage(
              d.percentage,
              d.percentage < 0
            );
          });

        bar
          .filter(function(d, i) {
            return i === 0 || d.class !== 'total';
          })
          .append('line')
          .attr('class', 'connector')
          .attr('x1', x.bandwidth() + 5)
          .attr('y1', function(d) {
            return y(d.end);
          })
          .attr('x2', x.bandwidth() / (1 - padding) - 5)
          .attr('y2', function(d) {
            return y(d.end);
          });

        return bar;
      };

      return {
        render
      };
    }
  ]);
