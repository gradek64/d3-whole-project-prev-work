/**
 * Created by Sergiu Ghenciu on 20/02/2018
 */

'use strict';

angular
  .module('components.chart', [
    'utils.misc',
    'utils.chart-data-format',
    'services.variance-service',
    'components.d3.prepare-data-service',
    'components.d3.tooltip-service',
    'components.d3.legend-service',
    'components.d3.labels-service',
    'components.d3.table-service',
    'components.d3.pie-service',
    'components.d3.bar-service',
    'components.d3.rows-service',
    'components.d3.sunburst-service',
    'components.d3.sankey-service',
    'components.d3.chord-service',
    'components.d3.waterfall-service',
    'components.d3.percentage-service',
    'components.d3.treemap-service',
  ])
  .directive('chart', [
    'misc',
    'chartDataFormat',
    'prepareDataService',
    'tooltipService',
    'legendService',
    'labelsService',
    'tableService',
    'pieService',
    'barService',
    'rowsService',
    'sunburstService',
    'sankeyService',
    'chordService',
    'waterfallService',
    'percentageService',
    'treemapService',
    function(
      _,
      chartDataFormat,
      prepareDataService,
      tooltipService,
      legendService,
      labelsService,
      tableService,
      pieService,
      barService,
      rowsService,
      sunburstService,
      sankeyService,
      chordService,
      waterfallService,
      percentageService,
      treemapService
    ) {
      const icons = {
        table: 'grid_on',
        line: 'show_chart',
        bar: 'insert_chart',
        donut: 'donut_large',
        pie: 'pie_chart_outlined',
        tree: 'view_quilt',
        treemap: 'view_quilt',
        partition: 'view_column',
        sunburst: 'radio_button_checked',
        map: 'place',
        sankey: 'shuffle',
        rows: 'view_column',
        chord: 'radio_button_checked',
        waterfall: 'assessment',
        percentage: 'view_column',
      };

      const propValue = _.prop('value');

      const getService = (scope) => {
        switch (scope.opts.type) {
          case 'table':
            return tableService(scope);
          case 'pie':
          case 'donut':
            return pieService;
          case 'bar':
            return barService;
          case 'rows':
            return rowsService;
          case 'sunburst':
            return sunburstService;
          case 'sankey':
            return sankeyService;
          case 'chord':
            return chordService;
          case 'waterfall':
            return waterfallService;
          case 'percentage':
            return percentageService;
          case 'treemap':
            return treemapService;
          default:
            return null;
        }
      };

      const children = (d, data) => data.filter((e) => e._parent === d._id);

      const descendants = (d, data, res = []) => {
        const ch = children(d, data);
        // console.log('children ' + d._id, ch);
        if (_.length(ch) === 0) {
          return [];
        }

        // return ch.concat(_.flatten(ch.map((e) => descendants(e, data))));
        return _.pipe(
          _.map((e) => descendants(e, data)),
          _.flatten,
          _.concat(ch)
        )(ch);
      };

      const value = (d, data, {type}) => {
        if (_.def(propValue(d))) {
          return propValue(d);
        }
        if (type === 'sunburst') {
          return _.pipe(_.map(propValue), _.filter(_.def), _.sum)(
            descendants(d, data)
          );
        }
      };

      const isNegative = (d, data, opts) => {
        return d.isNegative;
      };

      const percentage = (d, total) => {
        if (_.def(d.percentage)) {
          return d.percentage;
        }
        if (_.def(total)) {
          return _.when(
            _.always(d.isNegative),
            _.negate,
            _.percentage(propValue(d), total)
          );
        }
      };

      // prettier-ignore
      const legendItems = (data, depth, accessor, opts) => {
        const items = opts.type === 'sunburst' || opts.type === 'treemap'
            ? data.filter((e) => e.depth === depth)
            : data;
        return items.map(_.pick(['label']));
      };

      // prettier-ignore
      const labelItems = (data, depth, accessor, opts, total) => {
        const items = opts.type === 'sunburst'
            ? data.filter((e) => e.depth === depth)
            : data;

        return items.map((e) => {
          const val = value(e, data, opts);
          const text = chartDataFormat.formatToolTipText(
            val,
            isNegative(e, data, opts),
            opts.currency,
            percentage({value: val}, total),
            e.label
          );

          return {
            label: text,
          };
        });
      };

      // prettier-ignore
      const avoidFactory = (type) =>
          (d) => type === 'sunburst' && d.depth === 0;

      const avoidAnchorFactory = (type) => (d) =>
        type === 'waterfall' && d.class === 'total';

      const isArc = (type) =>
        type === 'pie' || type === 'donut' || type === 'sunburst';

      const renderLegend = (el, data, depth, accessor, opts) => {
        if (opts.legend && opts.type !== 'table' && opts.type !== 'treemap') {
          const legendContainer = el.querySelector('.legend');
          legendContainer.innerHTML = '';
          legendService.render(
            legendContainer,
            legendItems(data, depth, accessor, opts),
            opts
          );
        }
      };

      const renderLabels = (el, data, depth, accessor, opts, total) => {
        if (opts.labels && isArc(opts.type)) {
          labelsService.render(
            el,
            labelItems(data, depth, accessor, opts, total),
            opts
          );
        }
      };

      const tooltipLabel = (data, {type}) => {
        switch (type) {
          case 'sunburst':
          case 'treemap':
            return data.data.label;
          case 'sankey':
            return data.source.label + ' → ' + data.target.label + '\n';
        }
        return data.label;
      };

      // todo: unify data, an id would be necessary as well
      const getData = (d, {type}) => {
        if (type === 'chord') {
          return d.source;
        }
        if (type === 'sunburst') {
          return d;
        }
        return isArc(type) ? d.data : d;
      };

      const unsetActive = (arr, className = 'active') => {
        arr.forEach((e) => e.classList.remove(className));
      };

      const unAnchor = (el) => {
        el.classList.remove('anchored');
        unsetActive(el.querySelectorAll('.anchored-active'), 'anchored-active');
      };

      const anchoringFactory = (el, opts) => (getUnAnchor) => {
        if (getUnAnchor) {
          return () => unAnchor(el);
        }
        const avoid = avoidAnchorFactory(opts.type);
        return (d, i, a) => {
          if (avoid(d)) {
            return;
          }
          el.classList.add('anchored');
          unsetActive(a, 'anchored-active');
          a[i].classList.add('anchored-active');
        };
      };

      const onClickFactory = (scope, el, data, accessor, opts, total, cb) => {
        const sunburstZoom = sunburstService.sunburstZoomFactory(el, opts);
        scope.treemapZoom = treemapService.zoomFactory(el, opts);
        const avoid = avoidFactory(opts);
        return (d, i, a, event) => {
          // console.log('d', d);
          if (opts.type === 'sunburst') {
            if (!d.children) {
              return;
            }
            if (d.depth !== 0) {
              labelsService.removeLabels(el);
            }
            sunburstZoom(d).then(() => {
              // update legend
              const children = d.children.map((e) => e.data);
              let newOpts;
              if (d.depth !== 0) {
                const style = getComputedStyle(a[i].querySelector('path'));
                const color = style.getPropertyValue('fill');
                newOpts = _.dissoc('colors', opts);
                newOpts.colors = _.repeat(children.length, color);
              }
              renderLegend(
                el,
                children,
                d.depth + 1,
                {label: 'label'},
                newOpts || opts
              );

              // update labels
              if (d.depth === 0) {
                // todo: get the first level of zoomed state and draw labels
                // console.log(d.descendants().filter(
                // (e) => e.depth === d.depth + 1));
                renderLabels(el, data, 1, accessor, opts, total);
              }
            });
          }
          if (opts.type === 'treemap') {
            if (d.height === 0) {
              return;
            }
            if (_.undef(scope.treemapZoomItems)) {
              scope.treemapZoomItems = [];
            }
            scope.treemapZoomItems.push(d);
            scope.treemapZoom(d).then(() => {});
          }
          if (avoid(d)) {
            return;
          }

          cb(getData(d, opts), i, a, event);
        };
      };

      const onEnterFactory = (el, data, accessor, opts) => {
        const avoid = avoidFactory(opts.type);
        return (d, i, a) => {
          if (avoid(d)) {
            return;
          }
          el.classList.add('mouse-over');
          a[i].classList.add('active');
        };
      };

      const onLeaveFactory = (el) => (d, i, a) => {
        el.classList.remove('mouse-over');
        unsetActive(a);
        tooltipService.hideTooltip(el);
      };

      // prettier-ignore
      // eslint-disable-next-line
      const onMoveFactory = (el, data, accessor, opts, total) => {
        const avoid = avoidFactory(opts.type);
        return (d, i, a, event) => {
          if (avoid(d)) {
            return;
          }

          const d1 = getData(d, opts);
          // console.log(d1);
          const text = chartDataFormat.formatToolTipText(
              propValue(d1),
              d1.isNegative,
              opts.currency,
              percentage(d1, total),
              tooltipLabel(d1, opts)
          );
          tooltipService.showTooltip(el, text, event);
        };
      };

      const bindEvents = (scope, el, data, accessor, opts, total, leaves) => {
        const cb = scope.onLeafClick ? scope.onLeafClick(el) : _.noop;

        const onClick = onClickFactory(
          scope,
          el,
          data,
          accessor,
          opts,
          total,
          cb
        );
        const onEnter = onEnterFactory(el, data, accessor, opts);
        const onLeave = onLeaveFactory(el, data, accessor, opts);
        const onMove = onMoveFactory(el, data, accessor, opts, total);

        leaves.each((d, i, a) => {
          a[i].addEventListener('click', function(event) {
            onClick(d, i, a, event);
          });
          a[i].addEventListener('mouseenter', function(event) {
            onEnter(d, i, a, event);
          });
          a[i].addEventListener('mouseleave', function(event) {
            onLeave(d, i, a, event);
          });
          a[i].addEventListener('mousemove', function(event) {
            onMove(d, i, a, event);
          });
        });
      };

      const noData = (el) => {
        el.innerHTML = '';
        const h1 = document.createElement('h1');
        h1.style = 'text-align: center; color: #ccc; margin-top:90px;';
        h1.innerText = 'No data';
        el.appendChild(h1);
      };

      const render = (scope, el, data, accessor, options) => {
        const diagramContainer = el.querySelector('.diagram');
        if (!data || !data.length || !options.type) {
          return noData(diagramContainer);
        }
        const canvas = el.querySelector('.canvas');
        canvas.style = '';

        const defaults = {
          width: diagramContainer.clientWidth,
          height: diagramContainer.clientHeight,
          colors: [
            '#393b79',
            '#5254a3',
            '#6b6ecf',
            '#9c9ede',
            '#637939',
            '#8ca252',
            '#b5cf6b',
            '#cedb9c',
            '#8c6d31',
            '#bd9e39',
            '#e7ba52',
            '#e7cb94',
            '#843c39',
            '#ad494a',
            '#d6616b',
            '#e7969c',
            '#7b4173',
            '#a55194',
            '#ce6dbd',
            '#de9ed6',
          ],
          currency: '£',
        };
        const opts = Object.assign(defaults, options);
        const service = getService(scope);

        const total = propValue(accessor)
          ? prepareDataService.computeTotal(data, propValue(accessor))
          : undefined;

        const preparedData = prepareDataService.prepare(
          data,
          opts.type,
          accessor
        );

        if (opts.type === 'sankey') {
          let l = _.length(preparedData.links);
          if (l > 60) {
            let h = Math.min(3000, l * 15);
            canvas.style.height = h + 'px';
            canvas.style.maxHeight = 'none';
            opts.height = h;
          }
        }

        diagramContainer.innerHTML = '';
        const leaves = service.render(diagramContainer, preparedData, opts);

        renderLegend(el, preparedData, 1, accessor, opts);
        renderLabels(el, preparedData, 1, accessor, opts, total);

        if (opts.type !== 'table') {
          bindEvents(scope, el, preparedData, accessor, opts, total, leaves);
        }
      };

      const executeWhen = (pred, fn) => {
        let timerId = setInterval(() => {
          if (pred()) {
            clearInterval(timerId);
            fn();
          }
        }, 9);
      };

      const isNotLoading = (scope) => () => !scope.opts.isLoading;

      const updateType = (scope, type) => () => {
        scope.chartClass = propValue(type);
        scope.$digest();
      };

      const augment = (scope, element, changeCallback, exitCallback) => {
        scope.icons = icons;

        scope.selected = _.find(_.prop('selected'));

        scope.gt1 = _.gt(1);

        scope.value = propValue;

        scope.changeType = (type, index) => {
          // should be a separate component
          scope.types = _.map(_.dissoc('selected'), scope.types);
          scope.types[index]['selected'] = true;

          executeWhen(isNotLoading(scope), updateType(scope, type));
          changeCallback(type);
        };

        scope.exit = () => {
          exitCallback();
        };

        scope.download = () => {
          getService(scope).download(scope.opts);
        };

        scope.zoomOut = () => {
          console.log('zoom out', scope.treemapZoomItems);
          const d = scope.treemapZoomItems.pop();
          scope.treemapZoom(d.parent);
        };
      };

      const init = (scope, element) => {
        // register render callback
        const renderFactoryUp = _.ifIsFunctionCallOrNoop(scope.renderFactory);
        renderFactoryUp((data, accessor, opts) => {
          render(scope, element[0], data, accessor, opts);
        });

        const anchoringFactoryUp = _.ifIsFunctionCallOrNoop(
          scope.anchoringFactory
        );
        anchoringFactoryUp(anchoringFactory(element[0], scope.opts));

        scope.chartClass = scope.opts.type;

        // scope.opts.types should be sent as separate parameter (scope.types)
        scope.types = _.map(_.copyObj, scope.opts.types);

        augment(
          scope,
          element,
          _.ifIsFunctionCallOrNoop(scope.onChangeType),
          _.ifIsFunctionCallOrNoop(scope.onExit)
        );

        render(scope, element[0], scope.data, scope.accessor, scope.opts);
      };

      return {
        restrict: 'EA',
        scope: {
          opts: '=',
          data: '=',
          accessor: '=',
          renderFactory: '&?',
          onLeafClick: '&?',
          onGroupByClick: '&?',
          onChangeType: '&?',
          onExit: '&?',
          anchoringFactory: '&?',
        },
        templateUrl: 'components/chart/chart.html',
        link: init,
      };
    },
  ]);
