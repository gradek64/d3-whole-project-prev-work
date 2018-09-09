/**
 * Created by Sergiu Ghenciu on 27/03/2018
 */

'use strict';

angular
  .module('components.d3.chord-service', ['utils.misc'])
  .factory('chordService', [
    'misc',
    function(_) {
      const arcFactory = (radius, innerRad) =>
        d3
          .arc()
          .innerRadius(innerRad)
          .outerRadius(radius);

      const chordFactory = () => {
        const desc = (b, a) => _.compare(a, b);
        return d3
          .chord()
          .padAngle(0.05)
          .sortSubgroups(desc);
        // .sortChords(desc);
      };

      const computeMatrix = (data) => {
        const n = data.nodes.length;
        const matrix = [];
        let i = n;
        while (i--) {
          matrix.push(_.repeat(n, 0));
        }

        data.links.forEach((e) => {
          let i = e.source;
          let j = e.target;
          matrix[i][j] = e.value;
          if (i !== j) {
            matrix[j][i] = e.value;
          }
        });

        return matrix;
      };

      const render = (element, data, opts) => {
        const width = opts.width;
        const height = opts.height;
        const minSide = Math.min(width, height);
        const radius = minSide / 2;
        const innerRad = radius - 20;
        const arc = arcFactory(radius, innerRad);
        const ribbon = d3.ribbon().radius(innerRad);
        const chord = chordFactory();
        const color = _.scaleOrdinal(opts.colors);

        const matrix = computeMatrix(data);
        // console.log(matrix);

        // let matrix0 = [
        //   [0, 10, 5, 0],
        //   [10, 0, 3, 0],
        //   [5, 3, 0, 0],
        //   [0, 0, 0, 5],
        // ];

        const chordMatrix = chord(matrix);

        const svg = d3
          .select(element)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        const group = svg
          .append('g')
          .attr('class', 'groups')
          .selectAll('g')
          .data(chordMatrix.groups)
          .enter()
          .append('g');

        group
          .append('path')
          .style('fill', function(d) {
            return color(d.index);
          })
          .style('stroke', function(d) {
            return d3.rgb(color(d.index)).darker(0.5);
          })
          .attr('d', arc);

        group
          .append('text')
          .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
          })
          .attr('dy', '.35em')
          .attr('transform', function(d) {
            return (
              'rotate(' +
              (d.angle * 180 / Math.PI - 90) +
              ')' +
              'translate(' +
              (innerRad + 26) +
              ')' +
              (d.angle > Math.PI ? 'rotate(180)' : '')
            );
          })
          .style('text-anchor', function(d) {
            return d.angle > Math.PI ? 'end' : null;
          })
          .text(function(d) {
            return data.nodes[d.index].label;
          });

        const g = svg
          .selectAll('.chord')
          .data(chordMatrix)
          .enter()
          .append('path')
          .attr('class', 'chord')
          .style('stroke', function(d) {
            return d3.rgb(color(d.target.index)).darker(0.2);
          })
          .style('fill', function(d) {
            return color(d.target.index);
          })
          .attr('d', ribbon);

        return g;
      };

      return {
        render,
      };
    },
  ]);
