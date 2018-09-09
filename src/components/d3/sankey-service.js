/**
 * Created by Sergiu Ghenciu on 22/03/2018
 */

'use strict';
/* eslint-disable */
angular.module('components.d3.sankey-service', []).factory('sankeyService', [
  'misc',
  function(_) {
    const render = (element, data, opts) => {
      // console.log('sankey -----', data);
      // return;

      if (_.length(data.links) > 500) {
        const h1 = document.createElement('h1');
        h1.style = 'text-align: center; color: #ccc; margin-top:90px;';
        h1.innerText = 'The data is too big. Please apply filters.';
        element.appendChild(h1);
        return;
      }
      const margin = { top: 0, right: 0, bottom: 0, left: 0 };
      const width = opts.width - margin.left - margin.right;
      const height = opts.height - margin.top - margin.bottom;
      const color = _.scaleOrdinal(opts.colors);

      // the function for moving the nodes
      function dragmove(d) {
        d3
          .select(this)
          .attr(
            'transform',
            'translate(' +
              d.x +
              ',' +
              (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) +
              ')'
          );
        sankey.relayout();
        link.attr('d', path);
      }

      function highlight_node_links(node, i) {
        var remainingNodes = [],
          nextNodes = [];

        var stroke_opacity = '';
        if (d3.select(this).attr('data-clicked') == '1') {
          d3.select(this).attr('data-clicked', '0');
          // stroke_opacity = 0.2;
        } else {
          d3.select(this).attr('data-clicked', '1');
          stroke_opacity = 0.7;
        }

        var traverse = [
          {
            linkType: 'sourceLinks',
            nodeType: 'target'
          },
          {
            linkType: 'targetLinks',
            nodeType: 'source'
          }
        ];

        traverse.forEach(function(step) {
          node[step.linkType].forEach(function(link) {
            remainingNodes.push(link[step.nodeType]);
            highlight_link(link.id, stroke_opacity);
          });

          while (remainingNodes.length) {
            nextNodes = [];
            remainingNodes.forEach(function(node) {
              node[step.linkType].forEach(function(link) {
                nextNodes.push(link[step.nodeType]);
                highlight_link(link.id, stroke_opacity);
              });
            });
            remainingNodes = nextNodes;
          }
        });
      }

      function highlight_link(id, opacity) {
        d3.select('#link-' + id).style('stroke-opacity', opacity);
      }

      // append the svg object to the body of the page
      const svg = d3
        .select(element)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr(
          'viewBox',
          '0 0 ' +
            (width + margin.left + margin.right) +
            ' ' +
            (height + margin.top + margin.bottom)
        )
        .attr('preserveAspectRatio', 'xMidYMin')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Set the sankey diagram properties
      const sankey = d3
        .sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([width, height]);

      const path = sankey.link();

      // load the data
      sankey
        .nodes(data.nodes)
        .links(data.links)
        .layout(32);

      // add in the links
      const link = svg
        .append('g')
        .selectAll('.link')
        .data(data.links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('id', function(d, i) {
          d.id = i;
          return 'link-' + i;
        })
        .attr('d', path)
        .attr('stroke', function(d) {
          // console.log(d);
          return (d.color = color(d.source.id));
        })
        .style('stroke-width', function(d) {
          return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
          return b.dy - a.dy;
        });

      // add in the nodes
      let node = svg
        .append('g')
        .selectAll('.node')
        .data(data.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        })
        .on('click', highlight_node_links)
        .call(
          d3
            .drag()
            .subject(function(d) {
              return d;
            })
            // interfering with click
            // .on('start', function() {
            //   this.parentNode.appendChild(this);
            // })
            .on('drag', dragmove)
        );
      // add the rectangles for the nodes
      node
        .append('rect')
        .attr('height', function(d) {
          return d.dy;
        })
        .attr('width', sankey.nodeWidth())
        .style('fill', function(d) {
          return (d.color = color(d.id));
        })
        .style('stroke', function(d) {
          return d3.rgb(d.color).darker(2);
        });

      // add in the title for the nodes
      node
        .append('text')
        .attr('x', -6)
        .attr('y', function(d) {
          return d.dy / 2;
        })
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .attr('transform', null)
        .text(function(d) {
          return d.label;
        })
        .filter(function(d) {
          return d.x < width / 2;
        })
        .attr('x', 6 + sankey.nodeWidth())
        .attr('text-anchor', 'start');

      return link;
    };

    return {
      render
    };
  }
]);
