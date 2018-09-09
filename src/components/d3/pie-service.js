/**
 * Created by Sergiu Ghenciu on 01/03/2018
 *
 * Expected data structure: [{value: 10}, {value: 20}, ...]
 *
 */

'use strict';

angular
  .module('components.d3.pie-service', ['utils.misc'])
  .factory('pieService', [
    'misc',
    function(_) {
      const arcFactory = (type, radius) =>
        d3
          .arc()
          .outerRadius(radius)
          .innerRadius(type === 'donut' ? radius / 2 : 0);

      const render = (element, data, opts) => {
        const width = opts.width;
        const height = opts.height;
        const minSide = Math.min(width, height);
        const radius = minSide / 2;

        const color = _.scaleOrdinal(opts.colors);

        const arc = arcFactory(opts.type, radius);

        const pie = d3
          .pie()
          .sort(opts.sort)
          .value(_.prop('value'));

        const svg = d3
          .select(element)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', '0 0 ' + minSide + ' ' + minSide)
          .attr('preserveAspectRatio', 'xMidYMin')
          .append('g')
          .attr(
            'transform',
            'translate(' + minSide / 2 + ',' + minSide / 2 + ')'
          );

        const g = svg
          .selectAll('.arc')
          .data(pie(data))
          .enter()
          .append('g')
          .attr('class', 'arc');

        g
          .append('path')
          .attr('d', arc)
          .style('fill', (d) => color(d.index));

        return g;
      };

      return {
        render,
        arcFactory,
      };
    },
  ]);
