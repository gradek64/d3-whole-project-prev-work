/**
 * Created by joshrayman on 23/11/2016.
 */
'use strict';

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('ChartService', ['$window', '$rootScope', 'ChartDataFactory', 'CostQueryParameter', 'ReportService',
  function($window, $rootScope, ChartDataFactory, CostQueryParameter, ReportService) {
    function initialiseSvgParams(scope, element, SelectedChartService) {

      var container = $(".canvas", element[0]);

      if(container) {
        var width = container.width();
        var height = container.height();

        scope.width = width;
        scope.height = height;
      }

      // Accounts for chart title and icons above svg
      // scope.header = 75;
      scope.header = 0;

      scope.svg = d3.select(element[0]).select("svg");
      scope.g = scope.svg.select("g");

      // override header, set up some chart specific parameters
      SelectedChartService.init(scope, element);

      scope.width = width - scope.margin.left - scope.margin.right;
      scope.height = height - scope.margin.top - scope.margin.bottom - scope.header;

      scope.svg
      .attr("width", scope.width + scope.margin.left + scope.margin.right)
      .attr("height", scope.height + scope.margin.top + scope.margin.bottom);


      /*--------------------------------------- f
       *
       *             Resize
       *
       ---------------------------------------*/

      //bind page resize - revisit this, because you shouldn't need to re-render every time.
      angular.element($window).bind('resize', function(){
        if(!scope.chartInfo) { return null; }
        scope.resizeChart(scope, element);
      });

      $(element[0]).on('click', '.chart-controls .filter-toggle', function (event) {
        $(this).parent().toggleClass('open');
      });

      $(element[0]).on('click', '.chart-controls .th-toggle', function (event) {
        $(this).parent().toggleClass('open');
      });

      //remove resize binding on page change
      scope.$on('$destroy', function(e) {
        angular.element($window).unbind('resize');
      });
    }

    //Set up some default values for charts (in some cases these can be overridden by the object setting the chart up).
    function setScopeParams(scope, element) {
      //fix issues with bubble, force, dynamic sankey needing more distinct colors by using color10 instead of color20
      scope.defColor = (scope.chartInfo.type === "force" || scope.chartInfo.type === "force-p" ||
          scope.chartInfo.type === "bubble" || scope.chartInfo.dynamicSource) ? 2 : 0;

      var colors93456 = { options: [
        d3.schemeCategory20b,
        [
          "#2D7DA5", "#3A89BA", "#4A95CE", "#5DCEED", "#37B9DB", "#33AAD3", "#31A2BC", "#2B94A5", "#16888E", "#17688C", "#217E9E", "#0B73A0",
          "#2D8FAA", "#379DB5", "#42AFC1", "#67B7E8", "#55A0D8", "#2D9CBA", "#268BA3", "#178496", "#66A6ED", "#83D9FF"
        ],
        d3.schemeCategory10
      ], selected: d3.schemeCategory20};

      var getSelectedColor = function(i) {
        return colors93456.options[i];
      };

      //get color set
      if (!scope.chartInfo.colors) {
        scope.chartInfo.colors = getSelectedColor(scope.defColor);
      }

      //set up d3 color scale
      scope.color = d3.scaleOrdinal(scope.chartInfo.colors);

      //show/hide the chart toggle list (default show because all charts have tables and this menu allows access to that).
      scope.chartInfo.chartToggle = (typeof scope.chartInfo.chartToggle === 'boolean') ? scope.chartInfo.chartToggle : true;

      // Get custom headers or get defaults
      var key = (scope.chartInfo.query) ? scope.chartInfo.query.groupBy[0] : "Key";

      // Set headers
      scope.chartInfo.headers = scope.chartInfo.headers || [key];

      // disable table on dynamic sankey
      scope.chartInfo.tableEnabled = !scope.chartInfo.dynamicSource;
      scope.selectedTable = null;

      scope.chartInfo.groupByIdx = scope.chartInfo.groupByIdx || 0;

      scope.changeGroupBy = function(value, idx) {
        idx = idx || 0;

        scope.chartInfo.query.groupBy[idx] = value;
        scope.$emit("updateComponentGroupBy", scope.chartInfo);
      };

      /**
       * Get filters from component setup.
       */
      if(scope.chartInfo.filterOptions) {
        getFilters(scope);
      }

      /**
       * Toggle selected filter
       * @param filter
       */
      scope.toggleFilter = function(event, filter, filters, filterType) {
//       event.preventDefault();
        event.stopPropagation();

        //make sure select all box is unticked
        filterType.allSelected = false;

        var newFilterState = !filter.selected;
        scope.clearFilters(event, filters);
        filter.selected = newFilterState;

        $rootScope.$broadcast("ChartServiceToggleFilter", getAppliedFilters(scope));
        updateChart(scope, element);
      };

      /**
       * Remove all filters from selected list
       * @param filters
       */
      scope.clearFilters = function(event, filters, update) {
        for(var i = 0; i < filters.length; i++)
        {
          filters[i].selected = false;
        }

        if(update) {
          updateChart(scope, element);
        }
      };

      scope.selectAllFilters = function(filters, filterType) {
        filterType.allSelected = true;

        filters.map(function(v) {
          v.selected = false;
        });

        updateChart(scope, element);
      };

      /*---------------------------------------
       *
       *      Toggles (colors, chart type)
       *
       ---------------------------------------*/

      scope.$on('changeChartColors', function(event, data) {
        // color toggle is stored on page, toggles selecting between alt color schemes.
        // TODO: this will have to be modified to accommodate multiple color schemes
        var selColor = (data.colorToggle) ?  data.colorArr[scope.defColor] : data.colorArr[1];

        scope.chartInfo.colors = selColor;
        scope.color = d3.scaleOrdinal(selColor);

        if(scope.chartInfo.data) {
          scope.renderChart(scope, scope.chartInfo.data, element);
        }
      });
    }

    function getAppliedFilters(scope){
      var filters = [];

      for(var i = 0; i < scope.chartInfo.filterOptions.length; i++) {
        var filter = scope.chartInfo.filterOptions[i];

        for (var j = 0; j < filter.all.length; j++) {
          var option = filter.all[j];

          if (option.selected) {
            filters.push({field: filter.groupBy, value: option.name});
          }
        }
      }

      return filters;
    }

    function setAnnotationsScopeParams(scope) {
      /*---------------------------------------
       *
       *             Annotations
       *
       ---------------------------------------*/

      scope.annotationsEnabled = false;

      //Close annotations panel/mode
      scope.closeAnnotations = function() {
        console.log("close", scope.annotationsEnabled);
        scope.toggleAnnotationMenu(false);
        console.log("close", scope.annotationsEnabled);
      };

      scope.toggleAnnotationMenu = function(annotationsEnabled) {
        scope.annotationsEnabled = annotationsEnabled || !scope.annotationsEnabled;
        capitalizeFilter
        d3.selectAll("#footer .button-group").classed("annotations-enabled", scope.annotationsEnabled);

        if(scope.annotationsEnabled)
        {
          $("#menu-annotation").toggleClass("opened");
          $("#menu-filter").removeClass("opened");
          $("#menu-setting").removeClass("opened");
        }
        else {
          $("#menu-annotation").removeClass("opened");
        }

        $rootScope.$broadcast('toggleAnnotationMenu', scope.annotationsEnabled);
        var target = scope.chartInfo.type + '-' + scope.chartInfo.id;
        zoom(scope, element, target, render, resize, scope.annotationsEnabled);
      };

      scope.addNewText = function() {
        scope.tree.annotations.addNewText();
      };
    }

    function initialiseChart(scope, element, SelectedChartService)
    {
      /*---------------------------------------
       *
       *             Initialisation
       *
       ---------------------------------------*/
      scope.renderChart = function(scope, data, element) {
        if(!data) {
          //TODO find references to this and remove data, this is unneeded and provided by the scope.chartInfo.data.0
          data = scope.chartInfo.data;
        }

        resizeSvg(scope, element);
        clearSvg(scope);
        return SelectedChartService.render(scope, data, element);
      };
      scope.resizeChart = function(scope, element, overrideWidth, overrideHeight) {
        if(SelectedChartService.resize) {
          resizeSvg(scope, element, overrideWidth, overrideHeight);
          return SelectedChartService.resize(scope, element);
        }
      };

      scope.getDataAndRender = getDataAndRender;

      initialiseSvgParams(scope, element, SelectedChartService);

      if(scope.chartInfo) {
        setScopeParams(scope, element)
      }

      if(scope.chartInfo) {
        getDataAndRender(scope, element);
      }

      scope.$on('renderAllCharts', function() {
        scope.renderChart(scope, null, element);
      });

      //this is a work around because the cost flow logic is deeply embedded in the controller right now
      //ideally we would pull all this logic into the sankey levels directive/controller and then
      //cost flow can be detached from the dynamic sankey logic.
      scope.$on('getNewDataForComponent', function(ev, comp) {
        scope.chartInfo = comp;

        updateChart(scope, element);
        getDataAndRender(scope, element);
      });

      // scope.$on('updateComponentGroupBy', function() {
      //   showLoader(element);
      // });

      // Removes loading icon from Sankey, as this requires user input before it is loaded.
      // if(scope.chartInfo && scope.chartInfo.type === "sankey") {
      //   hideLoader(element);
      // }

      // brought this back on to cover the render issues with the it service statement
      // and dept. consumption which try to render before the data is filtered
      // TODO hookup a better trigger for this when awaiting a filter.
      // (This will also remove the unnecessary calls to the server)
      scope.$watch('chartInfo.data', function() {
        if(scope.chartInfo && scope.chartInfo.data) {
          scope.renderChart(scope, scope.chartInfo.data, element);

          // hide loading animation after successful load (if the js crashes out before this point,
          // the loading circle will persist.
          hideLoader(element);
        }
      });

      setAnnotationsScopeParams(scope);
    }

    function getFiltersFromServer(scope, filtersQuery, i) {
      ReportService.getCosts(filtersQuery).then(function(data) {
        var plainData = data.plain();
        scope.chartInfo.filterOptions[i].all = createFilterArray(plainData);
      });
    }

    function getFilters(scope) {
      for(var i = 0; i < scope.chartInfo.filterOptions.length; i++) {
        //TODO: the empty filter arr can be used to filter the filters.
        var chartQuery = scope.chartInfo.query;
        var filtersQuery = CostQueryParameter.createNew("ORGANISATION_CAPABILITIES", [scope.chartInfo.filterOptions[i].groupBy], chartQuery.filters, undefined, undefined, undefined, chartQuery.dimensionSnapshotUuid);
        getFiltersFromServer(scope, filtersQuery, i);
      }
    }

    function createFilterArray(plainData) {
      var arr = [];

      for(var x in plainData) {
        arr.push({ name: x, selected: false });
      }

      return arr;
    }

    function updateChart(scope, element) {
      var filters = getAppliedFilters(scope);

      //TODO: factor report level filtering
      scope.chartInfo.query.filters = filters;
      getDataAndRender(scope, element);
    }

    function showLoader(ele) {
      d3.select(ele[0]).select("svg").style('opacity', 0);
      d3.select(ele[0]).select(".loading").classed("hidden", false);
    }

    function hideLoader(ele) {
      d3.select(ele[0]).select("svg").style('opacity', 1);
      d3.select(ele[0]).select(".loading").classed("hidden", true);
    }

    function getDataAndRender(scope, element) {
      console.log("getData");
      showLoader(element);
      // this is my starting point towards a centralised data gatherer for charts.
      ReportService.getChartData(scope.chartInfo).then(function(data){
        hideLoader(element);

        var processDataObj = {
          plainData: data.plain(),
          type: scope.chartInfo.type,
          accessor: scope.chartInfo.query.accessor,
          interval: null,
          showUnits: scope.chartInfo.showUnits,
          target: scope.chartInfo.query.target,
          isOrdinal: (scope.chartInfo.axisInfo && scope.chartInfo.axisInfo.xType === 'ordinal')
        };

        var processedData = ChartDataFactory.processData(processDataObj);

        scope.chartInfo.data = processedData.data;
        scope.chartInfo.tableData = processedData.tableData;

        scope.$emit("updatingComponent6180", scope);

        var noDataLoaded = true;

        if(scope.chartInfo && scope.chartInfo.data) {
          noDataLoaded = false;

          scope.renderChart(scope, null, element);

          // Sankey data link table
          scope.selectedTable = angular.copy(scope.chartInfo);
          scope.selectedTable.type = "table";
          scope.selectedTable.zoomable = false;

          // hide loading animation after successful load (if the js crashes out before this point,
          // the loading circle will persist.
          d3.select(element[0]).select(".error").classed("hidden", true);
        }

        if(noDataLoaded) {
          d3.select(element[0]).select(".error").text("No Data!");
        }
      });
    }

    /*---------------------------------------
     *
     *             Zoom
     *
     ---------------------------------------*/

    function zoom(scope, element, target, render, resize, annotationsEnabled) {
      /*
          Unsure what state this code is in - zoom functionality was removed from pretty much all components a while ago
          so this has lagged behind a lot of the restructuring code. Probably best to re-write from scratch if this
          becomes a priority again.
       */

      // var canvasWrapper = d3.select(d3.select("#" + target).node().parentNode);
      // var isZoomIn = !canvasWrapper.classed("canvas-zoom");
      //
      // if(annotationsEnabled !== undefined && ((isZoomIn && !annotationsEnabled) || (!isZoomIn && annotationsEnabled))) {
      //   return null;
      // }
      //
      // if(scope.svg) {
      //   scope.svg.selectAll("g").transition().duration(0).style("opacity", "0");
      // }
      //
      // d3.selectAll("svg").classed("hidden", true);
      // var zoomSpan = d3.select("#" + target).select(".zoom-btn span");
      // var switchWrapper = d3.select(d3.select("#" + target).node().parentNode.parentNode.parentNode.parentNode);
      //
      // scope.isZoomed = !scope.isZoomed;
      // scope.footerOffset = (!isZoomIn) ? 0 : 80;
      //
      // canvasWrapper.classed("canvas-zoom", !canvasWrapper.classed("canvas-zoom"));
      //
      // // Used by charts which can be toggled to other types
      // if(switchWrapper.classed("chart-swap-wrapper")) {
      //   switchWrapper.classed("canvas-zoom", !switchWrapper.classed("canvas-zoom"));
      // }
      //
      // // Hide all other components
      // if(isZoomIn) {
      //   d3.selectAll(".canvas-wrapper").classed("hidden", true);
      //   d3.selectAll(".sankey-placeholder").classed("hidden", true);
      //   canvasWrapper.classed("hidden", false);   //Show selected (zoomed) component
      // }
      // else {
      //   // Hide annotations/footnotes on treemap
      //   canvasWrapper.selectAll(".footnotes").classed("hidden", true);
      // }
      //
      // // Change zoom icon
      // zoomSpan.classed("fa-search-minus", !zoomSpan.classed("fa-search-minus"));
      // zoomSpan.classed("fa-search-plus", !zoomSpan.classed("fa-search-plus"));
      //
      //
      // // Redraw d3 components
      // if(resize) {
      //   resize(scope, element, annotationsEnabled, isZoomIn);
      // }
      // else {
      //   render(scope, scope.chartInfo.data, element);
      // }
      //
      // // Table modal was being caught by the .canvas-wrapper hide call above.
      // d3.selectAll(".table-wrap .canvas-wrapper").classed("hidden", false);
      //
      // // Show all components again
      // if (!isZoomIn) {
      //   d3.selectAll(".canvas-wrapper").classed("hidden", false);
      //   d3.selectAll(".sankey-placeholder").classed("hidden", false);
      //   d3.selectAll("svg").classed("hidden", false);
      // }
      // else {
      //   //Show zoomed component svg
      //   canvasWrapper.selectAll("svg").classed("hidden", false);
      //   canvasWrapper.selectAll(".footnotes").classed("hidden", false);
      // }
      //
      // // Fade in resized d3 component
      // scope.svg.selectAll("g").transition().duration(750).style("opacity", "1");
    }

    function resizeSvg(scope, element, overrideWidth, overrideHeight) {
      var container = $(".canvas", element[0]);

      if(container === null || container.width() === 0) {
        container = $(".drilldown-chart", element[0]);
      }

      var newWidth = container.width();
      // container.height(newWidth) ;
      var newHeight = container.height();

      scope.width = overrideWidth || newWidth - scope.margin.left - scope.margin.right;
      scope.height = overrideHeight || newHeight - scope.margin.top - scope.margin.bottom - scope.header;

      if(scope.height <= 0) {
        scope.height = 100;
      }

      if(scope.chartInfo.toggleDrilldown && scope.chartInfo.type !== 'rows') {
        scope.width = d3.min([scope.width, scope.height]);
        scope.height = d3.min([scope.width, scope.height]);
      }

      scope.svg
      .attr("width", +scope.width + scope.margin.left + scope.margin.right)
      .attr("height", +scope.height + scope.margin.top + scope.margin.bottom);

      scope.g.attr("transform", "translate(" + scope.margin.left + "," + scope.margin.top + ")")
      .style("shape-rendering", "crispEdge");
    }

    function clearSvg(scope) {
      scope.g.selectAll("*").remove();
      scope.svg.selectAll("g#svg-tooltip").remove();
    }

    // Shade the arc and freeze the state
    function anchor(element, clickedElement, d1, isPie) {
      d3.select(element[0])
      .selectAll(".anchored-active")
      .classed("anchored-active", false);

      d3.select(clickedElement)
      .classed("anchored-active", true);

      d3.select(element[0])
      .classed("anchored", true)
      .select("div.legend")
      .selectAll(".legend-item")
      .filter(function(d2){return compare(d2, d1, isPie);})
      .classed("anchored-active", true);
    }

    function unAnchor(element) {

      d3.select(element[0])
      .classed("anchored", false)
      .selectAll(".anchored-active")
      .classed("anchored-active", false);
    }

    function compare(d2, d1, isBar) {
      if (isBar) {
        return d1.key === d2.key;
      }
      return d1.data.key === d2.key;
    }

    return {
      initialiseChart: initialiseChart,
      clearSvg: clearSvg,
      zoom: zoom,
      resizeSvg: resizeSvg,
      processData: ChartDataFactory.processData,
      anchor: anchor,
      unAnchor: unAnchor,
      compare: compare      // made public for tests
    };
  }]);
