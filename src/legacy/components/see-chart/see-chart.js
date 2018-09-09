/**
 * Created by joshrayman on 11/01/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app')
.directive('seeChart', [
  '$timeout',
  'events',
  'ChartService',
  'MapService',
  'ChordChartService',
  'SankeyChartService',
  'TableBreakdownService',
  'ChartIconService',
  'PercentageService',
  'LegendService',
  'DrilldownChartService',
  'SliderService',
  'TableService',
  'TreemapService',
  'CONSTANTS.EVENTS',
  function(
      $timeout,
      events,
      ChartService,
      MapService,
      ChordChartService,
      SankeyChartService,
      TableBreakdownService,
      ChartIconService,
      PercentageService,
      LegendService,
      DrilldownChartService,
      SliderService,
      TableService,
      TreemapService,
      EVENTS) {
    function init(scope, element, attrs)
    {
      $timeout(function(){
        callChart(scope, element);
      },0);

       const onOutputChange = (event, data) => {
;
        setTimeout(function(){
          scope.chartInfo = ChartIconService.getChartIcons(scope.chartInfo);
          scope.$apply();
         }, 0);
      };

      events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
      scope.$on('$destroy', () => {
        events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
      }); 

      console.log('scope.chartInfo');
      console.log(scope.chartInfo);

      //change chart type (turns table off by default)
      scope.changeType = function(type)
      {
        scope.chartInfo.type = type;

        $timeout(function(){
          callChart(scope, element);

          if (type === 'bar') {
            LegendService.hideLegendContent(element[0]);
          } else if (scope.chartInfo.renderLegend) {
            LegendService.showLegendContent(element[0]);
          }
        },0);
      };


      scope.$watch('chartInfo.pageId', function(oldV, newV) {
        if (oldV !== newV) {
          DrilldownChartService.disableDrilldown(scope, element, scope.resizeChart);
          SliderService.deleteSlides(d3.select(element[0]));
          callChart(scope, element);
        }
      });
    }

    function callChart(scope, element)
    {
      if(scope.chartInfo) {
        var selectedChartService = null;

        switch(scope.chartInfo.type) {
          case "percentage":
            selectedChartService = PercentageService;
            break;
          case "pie":
          case "donut":
            selectedChartService = PieChartService;
            break;
          case "bar":
            selectedChartService = BarChartService;
            break;
          case "rows":
            selectedChartService = RowChartService;
            break;
          case "map":
            selectedChartService = MapService;
            break;
          case "tree":
            selectedChartService = TreemapService;
            break;
          case "sunburst":
            selectedChartService = SunburstChartService;
            break;
          case "table":
            selectedChartService = TableService;
            break;
          case "chord":
            selectedChartService = ChordChartService;
            break;
          case "sankey":
            selectedChartService = SankeyChartService;
            break;
          case "partition":
            selectedChartService = PartitionTableService;
            break;
          case "table-breakdown":
            selectedChartService = TableBreakdownService;
            break;
          case "waterfall":
            selectedChartService = WaterfallChartService;
            break;
        }

        scope.chartInfo = ChartIconService.getChartIcons(scope.chartInfo);
        ChartService.initialiseChart(scope, element, selectedChartService);
      }
    }

    return {
      restrict: 'EA',
      scope: {
        chartInfo: '=info',
        selectmap:'&'
      },
      templateUrl: 'legacy/components/see-chart/see-chart.html',
      link: init
    };
  }]);
