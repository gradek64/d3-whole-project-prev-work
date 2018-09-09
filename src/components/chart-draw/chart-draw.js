/**
 * Created by Sergiu Ghenciu on 22/06/2018
 */

'use strict';

angular
  .module('components.chart-draw', [
    'components.chart',
    'utils.misc',
    'utils.chart-data-format',
    'services.report-groupbys-service',
  ])
  .directive('chartDraw', [
    'misc',
    'chartDataFormat',
    '$q',
    'reportGroupbysService',
    function(_, cdf, $q, reportGroupbysService) {
      const whenDef = _.when(_.def);

      const label = _.prop('label');
      const value = _.prop('value');
      const type = _.prop('type');
      const primary = _.prop('primary');
      const secondary = _.prop('secondary');
      const difference = _.prop('difference');
      const diffPercentage = _.prop('diffPercentage');
      const defaultTo0 = _.defaultTo(0);
      const lt0 = _.lt(0);

      const reduceToTotals = _.reduce((a, e) => {
        a.primary += defaultTo0(primary(e));
        a.secondary += defaultTo0(secondary(e));
        a.difference += defaultTo0(difference(e));
        a.diffPercentage += defaultTo0(diffPercentage(e));
        return a;
      });

      const fCurrency = (n) => cdf.formatCurrency(n, lt0(n), '£');

      const fPercentage = (n) => cdf.formatPercentage(n, lt0(n));

      const formatPercentage = _.ifElse(isFinite, fPercentage, _.always('-'));

      const formatCurrency = _.ifElse(isFinite, fCurrency, _.always('-'));

      const idToFilters = (id) =>
        _.reduce(
          (a, e) => {
            if (e !== '') {
              let parts = _.split(',', e);
              a.push({name: _.head(parts), value: _.nth(1, parts)});
            }
            return a;
          },
          [],
          _.split(';', id)
        );

      const selectedGroupBys = _.pipe(
        _.prop('groupByButtons'),
        _.filter(_.prop('selected'))
      );

      /*
       * {amount: '50£'} -> The total is ${amount} -> The total is 50£
       */
      const template = (data) => {
        let replaceFunctions = _.map(
          (e) => _.replace(RegExp('\\${' + e + '}', 'g'), data[e]),
          _.keys(data)
        );
        return (str) => _.reduce((a, b) => b(a), str, replaceFunctions);
      };

      const render = (scope) => {
        // const comp = _.merge(scope.opts, {});
        const comp = scope.opts;

        const groupBys = selectedGroupBys(scope.opts);

        comp.isLoading = true;
        setTimeout(() => {
          scope.$digest();
        });

        const accessor = scope.accessor(groupBys);

        // todo: review replacing title and subtitle
        let prev = _.defaultTo({}, _.last(scope.crumbs));
        // console.log('breadcrumbs', scope.crumbs);
        comp.subtitle = whenDef(
          template({
            dir: lt0(value(prev)) ? 'decrease' : 'increase',
            amount: fCurrency(_.abs(value(prev))),
            percent: fPercentage(_.abs(prev.percentage)),
          }),
          comp.subtitleTemplate
        );

        // console.log('groupBys', label(_.head(groupBys)));
        // console.log('groupBys title', comp.title);

        comp.title = whenDef(
          template(_.merge(prev, {groupBy: label(_.last(groupBys))})),
          comp.titleTemplate
        );

        scope
          .getData({
            filters: idToFilters('FUNCTIONAL,new;'),
            groupBy: groupBys,
            reportType: type(comp),
          })
          .then((data) => {
            // console.log('accessor', accessor);
            // console.log('variance', data);

            if (_.identical('table', type(comp))) {
              const total = reduceToTotals(
                {primary: 0, secondary: 0, difference: 0, diffPercentage: 0},
                data
              );

              let percentageTotal = _.percentage(
                secondary(total) - primary(total),
                primary(total)
              );
              // console.log('percentageTotal', percentageTotal);

              // comp.primaryTotal = primary(total);

              /* update chart info and render */
              comp.header = scope.header(accessor);
              comp.definition = _.concat(
                ['currency', 'currency', 'currency', 'percentage'],
                _.repeat(_.length(comp.header) - 4, 'string')
              );
              comp.footer = _.flatten([
                ['Total'],
                _.repeat(_.length(comp.header) - 5, ''),
                [
                  formatCurrency(primary(total)),
                  formatCurrency(secondary(total)),
                  formatCurrency(difference(total)),
                  formatPercentage(percentageTotal),
                ],
              ]);
            }

            comp.reportId = scope.reportId(type(comp));

            scope.renderDown(
              data,
              _.when(
                _.always(_.identical('percentage', type(comp))),
                _.merge({value: 'difference', percentage: 'diffPercentage'}),
                accessor
              ),
              comp
            );
          })
          .finally(() => {
            comp.isLoading = false;
          });
      };

      const augment = (scope, clickCbUp, groupByCbUp, onChangeTypeCbUp) => {
        scope.onClick = (d, i, a) => {
          clickCbUp(d, i, a);
        };

        scope.onChangeType = (type) => {
          scope.opts.type = value(type);

          scope.opts.groupByButtons = reportGroupbysService.getAll(
            scope.reportId(value(type))
          );

          render(scope);
          onChangeTypeCbUp(type);
        };

        scope.onGroupBy = (items) => {
          render(scope);
          groupByCbUp(items);
        };

        scope.renderFactory = (id) => (fn) => {
          scope[id] = fn;
        };
      };

      const init = (scope) => {
        /* start-dev-block */
        // console.log('------ THIS IS CHART-DRAW ------');
        /* end-dev-block */
        scope.getData = scope.getDataFactory();
        scope.accessor = scope.accessorFactory();
        scope.header = scope.headerFactory();

        scope.reportId = scope.reportId();

        augment(
          scope,
          _.ifIsFunctionCallOrNoop(scope.onClickUp),
          _.ifIsFunctionCallOrNoop(scope.onGroupByUp),
          _.ifIsFunctionCallOrNoop(scope.onChangeTypeUp)
        );

        setTimeout(() => {
          render(scope);
        }, 0);
      };

      return {
        scope: {
          opts: '=',
          anchoringFactory: '&?',
          getDataFactory: '&',
          accessorFactory: '&',
          headerFactory: '&',
          reportId: '&',
          crumbs: '=',
          onClickUp: '&?onClick',
          onExit: '&?',
          onGroupByUp: '&?onGroupBy',
          onChangeTypeUp: '&?onChangeType',
        },
        link: {
          pre: init,
        },
        template: `
  <div data-chart data-opts="opts"
                          data-data="::data"
                          data-accessor="::accessor"
                          data-render-factory="::renderFactory('renderDown')"
                          data-on-leaf-click="::onClick"
                          data-on-group-by-click="::onGroupBy"
                          data-on-change-type="::onChangeType"
                          data-on-exit="onExit()"
                          data-anchoring-factory="anchoringFactory()"></div>
`,
      };
    },
  ]);
