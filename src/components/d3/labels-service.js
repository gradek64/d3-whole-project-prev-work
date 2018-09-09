/**
 * Created by joshrayman on 24/05/2017
 * Adjusted by Sergiu Ghenciu 20/03/2018
 */

'use strict';
angular
  .module('components.d3.labels-service', [
    'utils.misc',
    'components.d3.sunburst-service',
    'components.d3.pie-service',
  ])
  .service('labelsService', [
    'misc',
    'sunburstService',
    'pieService',
    function(_, sunburstService, pieService) {
      const map = {};

      const sunburstGetKey = (d, i) => {
        // console.log(d);
        return String(d.x0);
        // return d.data.label;
      };

      const getKey = (d) => String(d.index);

      const showLabel = (d, startAngle, endAngle) => {
        // return true;
        return endAngle - startAngle > Math.PI * (1 / 10);
      };

      const isLeftSide = (d, startAngle, endAngle) => {
        if (startAngle + (endAngle - startAngle) / 2 > Math.PI) {
          return true;
        }
        return false;
      };

      const getVisible = (side) => {
        return Object.keys(map[side]).filter((e) => map[side][e]);
      };

      const getIndex = (visible, pos, isLeft) =>
        isLeft ? visible.length - pos - 1 : pos;

      const calculateX = (d, opts, isLeft) => {
        if (isLeft) {
          return -(opts.width / 2);
        } else {
          return opts.width / 2;
        }
      };

      const calculateY = (d, opts, isLeft, getKeyFn, i) => {
        let top = -opts.height / 2 + 10;

        const visible = getVisible(isLeft ? 'left' : 'right');
        const pos = visible.indexOf(getKeyFn(d, i));

        if (pos > -1) {
          return (
            top + opts.height / visible.length * getIndex(visible, pos, isLeft)
          );
        }

        return 0;
      };

      const removeLabels = (el) => {
        const arcs = d3.select(el).selectAll('.arc');
        arcs.selectAll('.labelText').remove();
        arcs.selectAll('.labelLine').remove();
      };

      const mapLabels = (arcs, startAngleFn, endAngleFn, getKeyFn) => {
        map.left = {};
        map.right = {};
        arcs.each(function(d, i, a) {
          if (isLeftSide(d, startAngleFn(d), endAngleFn(d))) {
            map.left[getKeyFn(d, i)] = true;
          } else {
            map.right[getKeyFn(d, i)] = true;
          }
        });
      };

      const addLabels = (
        arcs,
        data,
        opts,
        arcFn,
        startAngleFn,
        endAngleFn,
        getKeyFn
      ) => {
        const color = _.scaleOrdinal(opts.colors);

        mapLabels(arcs, startAngleFn, endAngleFn, getKeyFn);

        arcs.each(function(d, i, a) {
          const startAngle = startAngleFn(d);
          const endAngle = endAngleFn(d);
          const show = showLabel(d, startAngle, endAngle);
          const colorCode = color(getKeyFn(d, i));
          if (!show) {
            return;
          }
          const isLeft = isLeftSide(d, startAngle, endAngle);
          const x = calculateX(d, opts, isLeft);
          const y = calculateY(d, opts, isLeft, getKeyFn, i);

          const arc = d3.select(a[i]);

          arc
            .append('text')
            .attr('class', 'labelText')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', () => (isLeft ? 'start' : 'end'))
            .attr('dx', '0')
            .attr('dy', '0.35em')
            .text(data[i].label);
          arc
            .append('polyline')
            .attr('class', () => 'labelLine')
            .attr('stroke', colorCode)
            // .attr('stroke', '#555')
            .attr('points', () => {
              const start = arcFn.centroid(d);
              const end = [x, y + 10];
              const mid = [start[0] + end[0] / 4, end[1]];
              return [start, mid, end];
            });
        });
      };

      const render = (el, data, opts) => {
        removeLabels(el);

        const radius = Math.min(opts.width, opts.height) / 2;
        const arcs = d3.select(el).selectAll('.arc');

        if (opts.type === 'sunburst') {
          const x = sunburstService.xFactory(radius);
          const y = sunburstService.yFactory(radius);
          const arcFn = sunburstService.arcFactory(x, y);

          return addLabels(
            arcs.filter((d) => d.depth === 1),
            data,
            opts,
            arcFn,
            sunburstService.startAngleFactory(x),
            sunburstService.endAngleFactory(x),
            sunburstGetKey
          );
        }

        const arcFn = pieService.arcFactory(opts.type, radius);

        return addLabels(
          arcs,
          data,
          opts,
          arcFn,
          (d) => d.startAngle,
          (d) => d.endAngle,
          getKey
        );
      };

      return {
        removeLabels: removeLabels,
        render: render,
      };
    },
  ]);
