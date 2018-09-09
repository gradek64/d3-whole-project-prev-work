/**
 * Created by Sergiu Ghenciu on 22/05/2018
 */

'use strict';

angular
  .module('components.d3.treemap-service', [
    'utils.misc',
    'utils.chart-data-format',
  ])
  .factory('treemapService', [
    'misc',
    '$q',
    function(_, $q) {
      const value = _.prop('value');

      const getParent = (d) =>
        d.depth === 1 || _.isNil(d.parent) ? d : getParent(d.parent);

      const shade = (color, depth) =>
        depth === 1 ? color : d3.color(color).darker((depth - 1) * 0.4);

      const maxArea = _.reduce((a, b) => _.max(a, value(b)), 0); // in one go

      const minArea = _.pipe(_.map(value), _.minAll); // in two gos but more rea

      const opacity = (color, d) => {
        if (_.isNil(d.parent) || d.depth === 1) {
          return color;
        }

        let p = d.parent;

        /* start-dev-block */
        // console.log(
        //   _.take(7, p.data.label) + '...',
        //   'MIN MAX',
        //   minArea(p.children),
        //   maxArea(p.children)
        // );
        // console.log(_.take(7, p.data.label) + '...', 'area(d)', area(d));
        /* end-dev-block */

        const opacityScale = _.pipe(
          _.domain(minArea(p.children), maxArea(p.children)),
          _.coDomain(0.7, 1)
        );

        let c = d3.rgb(color);
        c.opacity = opacityScale(value(d));
        return c.toString();
      };

      const xFactory = (width) =>
        d3
          .scaleLinear()
          .domain([0, width])
          .range([0, width]);

      const yFactory = (height) =>
        d3
          .scaleLinear()
          .domain([0, height])
          .range([0, height]);

      const treemapFactory = (width, height) =>
        d3.treemap().size([width, height]);

      const onEndFactory = (el, opts, cells, cb, d) => {
        return () => {
          if (d.height === 0) {
            return;
          }
          // d.leaves().forEach((d, i, a) => {
          //   console.log('a[i]', d3.select(el).select(d));
          // });
          // console.log('d', d);
          // console.log('d.leaves()', d.leaves());
          // console.log('d.ancestors()', d.ancestors());
          cells
            .style('display', (d1) => {
              return _.includes(d1, d.leaves()) ? 'block' : '';
            })
            .style('display', (d1) => {
              return _.includes(d1, d.ancestors()) ? 'none' : '';
            });
          // .style('pointer-events', (d1) => {
          //   return d1 === d && d1.height > 0 ? 'none' : 'block';
          // });

          cells.selectAll('.label span').style('opacity', function(d1, i, a) {
            // if (_.includes(d1, d.leaves())) {
            // console.log('a[i]', a[i]);
            let p = a[i].parentElement;
            return a[i].offsetWidth > p.offsetWidth ||
              a[i].offsetHeight > p.offsetHeight
              ? 0
              : 1;
            return a[i].offsetWidth > a[i].parentElement.offsetWidth ? 0 : 1;
            // }
          });

          el.setAttribute('data-zoom-depth', d.depth);

          cb();
        };
      };

      const zoomFactory = (el, opts) => {
        const cells = d3.select(el).selectAll('.node');
        const x = xFactory(100);
        const y = yFactory(100);

        return (d) => {
          return $q((resolve) => {
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);

            cells
              .transition()
              .on('end', _.once(onEndFactory(el, opts, cells, resolve, d)))
              .duration(750)
              .style('left', (d) => x(d.x0) + '%')
              .style('top', (d) => y(d.y0) + '%')
              .style('width', (d) => {
                return x(d.x1) - x(d.x0) + '%';
              })
              .style('height', (d) => y(d.y1) - y(d.y0) + '%');
          });
        };
      };

      const render = (element, data, opts) => {
        // color = d3.scaleOrdinal().range(d3.schemeCategory20c);
        const width = 100;
        const height = 100;
        const color = _.scaleOrdinal(opts.colors);

        const treemap = treemapFactory(width, height);

        const container = d3
          .select(element)
          .append('div')
          .style('position', 'relative')
          .style('overflow', 'hidden')
          .style('width', width + '%')
          .style('height', height + '%');

        const childrenFactory = (data) => (d) =>
          data.filter((e) => e._parent === d._id);

        // console.log('data', data);
        const root = d3.hierarchy(data, childrenFactory(data)).sum(value);

        // const root = d3
        //   .stratify()
        //   .id(function(d) {
        //     return d._id;
        //   })
        //   .parentId(function(d) {
        //     return d._parent;
        //   })(data);

        const tree = treemap(root);
        // console.log('tree', tree);

        const cells = container
          .selectAll('.node')
          .data(tree.descendants())
          .enter()
          .append('div')
          .attr('class', function(d) {
            return 'node level-' + d.depth;
          })
          .style('left', (d) => d.x0 + '%')
          .style('top', (d) => d.y0 + '%')
          .style('width', (d) => d.x1 - d.x0 + '%')
          .style('height', (d) => d.y1 - d.y0 + '%')
          .style('background-color', (d, i) => {
            return opacity(shade(color(getParent(d).data.label), d.depth), d);
          });

        cells
          .append('div')
          .attr('class', 'label')
          .append('span')
          .text((d) => d.data.label)
          .style('opacity', function(d, i, a) {
            let p = a[i].parentElement;
            return a[i].offsetWidth > p.offsetWidth ||
              a[i].offsetHeight > p.offsetHeight
              ? 0
              : 1;
            return a[i].offsetWidth > a[i].parentElement.offsetWidth ? 0 : 1;
          });

        return cells;
      };

      return {
        render,
        zoomFactory,
      };
    },
  ]);
