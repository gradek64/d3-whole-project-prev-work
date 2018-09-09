/**
 * Created by Sergiu Ghenciu on 16/03/2018
 */

'use strict';

angular
  .module('components.d3.sunburst-service', [])
  .factory('sunburstService', [
    'misc',
    '$q',
    function(_, $q) {
      const innerRadFactory = (y) => (d) => Math.max(0, y(d.y0));

      const outerRadFactory = (y) => (d) => Math.max(0, y(d.y1));

      // prettier-ignore
      const startAngleFactory = (x) => (d) =>
          Math.max(0, Math.min(2 * Math.PI, x(d.x0)));

      // prettier-ignore
      const endAngleFactory = (x) => (d) =>
          Math.max(0, Math.min(2 * Math.PI, x(d.x1)));

      const xFactory = (radius) => d3.scaleLinear().range([0, 2 * Math.PI]);

      const yFactory = (radius) => d3.scaleSqrt().range([0, radius]);

      const arcFactory = (x, y) =>
        d3
          .arc()
          .startAngle(startAngleFactory(x))
          .endAngle(endAngleFactory(x))
          .innerRadius(innerRadFactory(y))
          .outerRadius(outerRadFactory(y));

      const getParent = (d) =>
        d.depth === 1 || d.parent === null ? d : getParent(d.parent);

      const getColor = (color, depth) =>
        depth === 1 ? color : d3.color(color).darker((depth - 1) * 0.4);

      const sunburstZoomFactory = (el, opts) => {
        const radius = Math.min(opts.width, opts.height) / 2;
        const x = xFactory(radius);
        const y = yFactory(radius);
        const arc = arcFactory(x, y);
        const svg = d3.select(el).select('svg');

        return (d) => {
          return $q((resolve) => {
            svg
              .transition()
              .on('end', resolve)
              .duration(750)
              .tween('scale', function() {
                let xd = d3.interpolate(x.domain(), [d.x0, d.x1]);
                let yd = d3.interpolate(y.domain(), [d.y0, 1]);
                let yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                return function(t) {
                  x.domain(xd(t));
                  y.domain(yd(t)).range(yr(t));
                };
              })
              .selectAll('path')
              .attrTween('d', (d) => () => arc(d));
          });
        };
      };

      const render = (element, data, opts) => {
        const width = opts.width;
        const height = opts.height;
        const minSide = Math.min(width, height);
        const radius = minSide / 2;
        const color = _.scaleOrdinal(opts.colors);

        const x = xFactory(radius);
        const y = yFactory(radius);
        const arc = arcFactory(x, y);
        const partition = d3.partition();

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

        const childrenFactory = (data) => (d) =>
          data.filter((e) => e._parent === d._id);
        // console.log('data', data);
        const root = d3
          .hierarchy(data, childrenFactory(data))
          .sum((d) => d.value)
          .sort((a, b) => 0);
        // console.log('root', root);
        // return;
        let part = partition(root).descendants();
        // .filter(function(d) {
        //   return d.data.label !== '';
        // });
        // console.log('part', part);
        // console.log('part', partition(root).descendants());

        const g = svg
          .selectAll('.arc')
          .data(part)
          .enter()
          .append('g')
          .attr('class', 'arc');

        g
          .append('path')
          .attr('d', arc)
          .style('fill', function(d, i) {
            // set color of root to white
            if (d.depth === 0) {
              return '#fff';
            }
            return getColor(color(getParent(d).x0), d.depth);
          });

        return g;
      };

      return {
        render,
        innerRadFactory,
        outerRadFactory,
        startAngleFactory,
        endAngleFactory,
        xFactory,
        yFactory,
        arcFactory,
        getParent,
        sunburstZoomFactory,
      };
    },
  ]);
