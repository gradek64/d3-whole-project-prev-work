/**
 * Created by joshrayman on 05/04/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('DrilldownChartService', ['$compile', 'TableService', 'ReportService', 'ChartService',
  function($compile, TableService, ReportService, ChartService) {

    function getSecondGroupBy(key) {
      switch(key) {
        case 'other':
          return null;
        case 'labour':
          return 'Role';
        case 'contracts':
          return 'Vendor';
      }
    }

    //enable drilldown (pie/bar)
    function enableDrilldown(scope, element, d, resize, type) {
      console.log("drill", element, d, resize, type);
      $("see-chart.small-table").remove();
      var clickedElement = this;
      scope.chartInfo.toggleDrilldown = true;

      var isPie = (type === 'pie');
      var ele = element[0];

      if(d3.select(ele).classed('collapse-left') === false) {
        $(ele).find("svg").fadeTo(100, 0);
        d3.select(ele).classed('collapse-left', true);
      }

      if(d3.event) {
        d3.event.stopPropagation();
      }

      var defIdx, secondGroupBy, filter, drilldownChartType, name, groupBy, parentEle, filterGroupBy;

      filterGroupBy = scope.chartInfo.query.groupBy[0];

      if(type === 'waterfall') {
        secondGroupBy = getSecondGroupBy(d.key);

        filter = filterGroupBy + ',' + d.key;
        drilldownChartType = 'percentage';
        name = 'Drill Down for ' + d.key;

        parentEle = ele;
      } else {
        // for pie, bar chart drilldowns
        var key = (d.data ? d.data.key : d.key);
        secondGroupBy = 'itrs';

        if(scope.chartInfo.selectableGroupBys) {
          defIdx = (filterGroupBy === scope.chartInfo.selectableGroupBys[1].value) ? 0 : 1;
          secondGroupBy = scope.chartInfo.selectableGroupBys[defIdx].value;
        }

        filter = scope.chartInfo.query.groupBy[0] + ',' + key;
        drilldownChartType = 'rows';
        name = 'Drill Down for ' + key;

        parentEle = ele.parentNode;
      }
      groupBy = [filterGroupBy, secondGroupBy];

      scope.chartInfo.parentGroupBy = filterGroupBy;

      setTimeout(function () {
        resize(scope, element);
        $(ele).find("svg").fadeTo(250, 1);

        // reversed this to include waterfall - could be problematic.
        if(type === 'bar' && scope.chartInfo.drilldownType !== 'itrs') {
          addDrilldownTable(scope, d, element);
        }
        else {
          addDrilldownChart(scope, element, filter, drilldownChartType, groupBy, name);
        }
      }, 500);

      ChartService.anchor(element, clickedElement, d, isPie);
    }

    function addDrilldownTable(scope, d, parentEle) {
      var selectedNode = d3.select(parentEle);

      //not ideal..
      selectedNode.selectAll(".drilldown-table").remove();

      var table = selectedNode.append("div")
      .attr("class", "col-xs-6 drilldown-table")
      .append("table")
      .attr("class", "data-table")
      .attr("id", "drilldown");

      var drilldownParent = d.key;

      addDetail(scope, d, table, drilldownParent);
    }

    //remove drilldown (pie/bar)
    function disableDrilldown(scope, element, resize) {
      scope.chartInfo.toggleDrilldown = false;
      var ele = element[0];

      if(d3.select(ele).classed('collapse-left') === true) {
        var parentEle = ele.parentNode;

        $(ele).find("svg").fadeTo(0, 0);
        d3.select(ele).classed('collapse-left', false);
        removeDrilldownChart(parentEle);

        setTimeout(function() {
          resize(scope, element);
          ChartService.unAnchor(element);
          $(ele).find("svg").fadeTo(250, 1);
        }, 500);
      }
    }

    function getDrilldownInfo(drilldownParent, parentKey) {
      var mockFileToOpen = "sample-staff";
      var headers = [];
      var lookups = [];
      var baseGroup = "";

      if(drilldownParent) {
        switch(drilldownParent) {
          case "Datacenter":
          case "Data Center":
          case "Datacentre":
          case "Data Centre":
            mockFileToOpen = "sample-dc";
            headers = ["Data Centre ID", "Location", "Floor", "Rack Number", "Amount"];
            lookups = ["Location", "Floor", "RackNumber"];
            baseGroup = "data_centre_id";
            break;
          case "Server":
          case "servers":
            mockFileToOpen = "sample-server";
            headers = ["Server ID", "Location", "Operating System", "Platform", "Memory", "Model", "Environment", "Make", "Amount"];
            lookups = ["DataCentreLocation", "OperatingSystem", "Platform", "Memory", "Model", "Environment", "Make"];
            baseGroup = "servers_id";
            break;
          case "Storage":
            mockFileToOpen = "sample-storage";
            headers = ["Storage ID", "Server ID", "Operating System", "Serial Number", "Used Capacity", "Amount"];
            lookups = ["servers_id", "OperatingSystem", "SerialNumber", "UsedCapacity"];
            baseGroup = "storage_id";
            break;
          default:
            break;
        }
      }
      else {
        switch(parentKey) {
          case "Staff":
            mockFileToOpen = "sample-staff";
            headers = ["Labour ID", "Legal Entity", "Employee ID", "Cost Centre", "Location", "Amount"];
            lookups = ["SourceLegalEntity", "EmployeeId", "CostCentre", "Location"];
            baseGroup = "labour_id";
            break;
          case "Non-Staff":
            mockFileToOpen = "sample-contracts";
            headers = ["Contract ID", "Legal Entity", "Nominal ID", "Cost Centre", "Vendor", "Amount"];
            lookups = ["SourceLegalEntity", "NominalId", "CostCentre", "Vendor"];
            baseGroup = "contracts_id";
            break;
          case "Other":
            mockFileToOpen = "sample-other";
            headers = ["Other ID", "Legal Entity", "Cost Centre", "Amount"];
            lookups = ["SourceLegalEntity", "CostCentre"];
            baseGroup = "other_id";
            break;
        }
      }


      return {
        mockFile: mockFileToOpen,
        headers: headers,
        lookups: lookups,
        baseGroup: baseGroup
      }
    }

    function addDetail(scope, d, element, drilldownParent, drilldownInfo) {
      console.log("add detail", d, scope.chartInfo, drilldownParent);

      var parentKey = null;

      // three streams come into this
      // 1) partition table by means of sunburst
      // 2) partition table from regular table (itss)
      // 3) table breakdown
      // probably should cut this down.

      var isRegularTable = (drilldownInfo && drilldownInfo.type) ? (drilldownInfo.type === 'regular') : false;

      if(d) {
        parentKey = (d.parent) ? d.data.key : (d.level1) ? d.level1 : d.key;

        if(d.depth > 1) {
          isRegularTable = true;
        }
      }

      var queryGroupBy = scope.chartInfo.query.groupBy;

      var q = scope.chartInfo.partitionQuery || scope.chartInfo.query;

      //TODO: very flimsy
      var groupBy = (scope.chartInfo.isDrilldown) ? q.groupBy : queryGroupBy[queryGroupBy.length - 1];

      if(isRegularTable) {
        groupBy = queryGroupBy[0];

        if(parentKey !== null) {
          drilldownParent = parentKey;
        }

        parentKey = null;
      }

      var filters = (q) ? q.filters : [];

      if(parentKey || isRegularTable) {
        addParentFilter(filters, groupBy, parentKey || drilldownParent);
      } else {
        filters = scope.chartInfo.query.filters;
      }

      function addParentFilter(filters, groupBy, key) {
        var partitionFilter = { field: groupBy, value: key };

        if(filters.length > 0) {
          if(filters.filter(function(d) { return d.field === groupBy && d.value === key }).length === 0) {
            filters.push(partitionFilter);
          }
        }
      }

      var table = element;

      var drilldownInfo = drilldownInfo || getDrilldownInfo(drilldownParent, parentKey);

      if(drilldownInfo && drilldownInfo.type === 'regular') {
        drilldownInfo = getDrilldownInfo(drilldownParent, parentKey);
      }

      //var mockFileToOpen = drilldownInfo.mockFile;
      var headers = drilldownInfo.headers;
      var lookups = drilldownInfo.lookups;
      var baseGroup = drilldownInfo.baseGroup;

      var queryBase = scope.chartInfo.detailQuery || scope.chartInfo.query;

      var payload = {
        "baseGroup": baseGroup,
        "uniqueValueFields": lookups.toString(),
        "metricValueFields": queryBase.target,
        "filters": filters
      };

      //TODO: retrieve getSplitData

      //d3.json("data/" + mockFileToOpen + ".json", function(error, data) {
      ReportService.getFlatData(payload).then(function(data) {
        data = data.plain();
        addTable(scope, data, headers, table, lookups);
      });
    }

    function addTable(scope, data, headers, table, lookups) {
      console.log("load table", table);
      table.selectAll("*").remove();
      table.select("thead").remove();
      table.select("tbody").remove();


      TableService.addHeaders(table, headers, scope);

      var tbody = table.append("tbody");

      var counter = 0;

      for(var x in data)
      {
        var row = tbody.append("tr")
        .attr("class", (counter % 2 === 0) ? "level2": "level1");

        counter++;

        var idInfo = {
          row: row,
          level: x,
          isRoot: true
        };

        TableService.addSingleCell(idInfo, scope);

        for(var j = 0; j < lookups.length; j++) {
          var info = {
            row: row,
            level: lookups[j],
            data: data[x]
          };

          TableService.addSingleCell(info, scope);
        }

        var infoMetrics = {
          row: row,
          level: lookups[j],
          data: data[x],
          target: "metrics",
          accessor: "amount",
          metric: "sum"
        };

        TableService.addSingleCell(infoMetrics, scope);
      }

      d3.select(".cu-header").classed("hidden", false);
    }

    // this is the code relating to triggering the drilldown table from a row chart (which is nested inside a bar/pie click ev)
    function addItrsTable(scope, element, d) {
      scope.tableComp = angular.copy(scope.chartInfo);

      scope.tableComp.type = "table";
      scope.tableComp.name = "Table Breakdown"; // for " + d.key;
      scope.tableComp.disableHeader = true;
      scope.tableComp.showPercentage = true;

      scope.tableComp.data = [];
      scope.tableComp.tableData = [];

      scope.tableComp.query.filters.push(scope.tableComp.query.groupBy[1] + "," + d.key);

      if(scope.tableComp.query.groupBy[1] === 'itrs') {
        scope.tableComp.query.groupBy = ['itrs', 'subItrs', 'subSubItrs'];
        scope.tableComp.headers = ['IT Resource Stack', 'Sub IT Resource Stack', 'Sub Sub IT Resource Stack'];
      } else if(scope.tableComp.query.groupBy[1] === 'CostPoolMapping') {
        scope.tableComp.query.groupBy = ['CostPoolMapping'];
        scope.tableComp.headers = ['Cost Pool'];
      } else {
        var groupByHeaders = scope.chartInfo.selectableGroupBys.filter(function(d){ return d.value !== scope.tableComp.query.groupBy[1] & d.value !== 'itrs'; });

        scope.tableComp.query.groupBy = groupByHeaders.map(function(d){ return d.value; });
        scope.tableComp.query.groupBy.push('Date');

        scope.tableComp.headers = groupByHeaders.map(function(d){ return d.display; });
        scope.tableComp.headers.push('Period');
      }

      scope.tableComp.selectableGroupBys = null;

      ReportService.updateComponent(scope.tableComp, scope.tableComp.query);

      if(d3.select(element[0].parentNode).selectAll(".small-table").size() === 0) {
        var newElement = $compile('<see-chart class="small-table" info="tableComp"></see-chart>')(scope);
        angular.element(element[0].parentNode).append(newElement[0]);
      }
      else {
        d3.select(element[0].parentNode).selectAll(".small-table").style("opacity", 1);
      }
    }

    function hideItrsTable(element) {
      if(d3.select(element[0].parentNode).selectAll(".small-table").size() > 0) {
        d3.select(element[0].parentNode).selectAll(".small-table").style("opacity", 0);
      }
    }

    function addDrilldownChart(scope, element, filter, type, groupBy, name) {

      // if(scope.drillDownChart === undefined) {
      //   console.log('asdasdfasdfsd')
      scope.drillDownChart = angular.copy(scope.chartInfo);
      // }

      scope.drillDownChart.isDrilldown = true;

      scope.drillDownChart.type = type;
      scope.drillDownChart.name = name;
      scope.drillDownChart.disableHeader = true;

      scope.drillDownChart.data = [];
      scope.drillDownChart.tableData = [];

      scope.drillDownChart.groupByIdx = 1;

      if(scope.drillDownChart.selectableGroupBys) {
        scope.drillDownChart.selectableGroupBys = scope.drillDownChart.selectableGroupBys.filter(function(d) { return d.value !== groupBy[0]; })
      }
      else {
        scope.drillDownChart.selectableGroupBys = scope.drillDownChart.drilldownGroupBys;
      }

      if(scope.drillDownChart.query) {
        scope.drillDownChart.query.groupBy = groupBy;
        scope.drillDownChart.query.filters.push(filter);

        if(type === 'percentage') {
          addVarianceDrilldown(scope, groupBy, filter);
        }
        else {
          ReportService.updateComponent(scope.drillDownChart, scope.drillDownChart.query);
        }

        var drillChart = angular.element(element).find(".drilldown-chart");

        // if(drillChart) {
        //   drillChart.remove();
        // }
        if(!drillChart.length) {

          // var newElement = angular.element('<div class="drilldown-chart"><see-chart info="drillDownChart"></see-chart></div>');
          //
          // angular.element(element).find(".chart").append(newElement);
          //
          // console.log("add4", newElement);
          //
          // $compile(newElement)(scope);



          var newElement = angular.element('<div class="drilldown-chart"><see-chart data-info="drillDownChart"></see-chart></div>');

          var parent = angular.element(element).find(".chart");
          parent.append(newElement);

          console.log("add4", parent);

          var compileEle = parent.find(".drilldown-chart");

          $compile(compileEle)(scope);


        }

      }
    }

    function addVarianceDrilldown(scope, groupBy, filter) {
      scope.drillDownChart.varianceQuery.groupBy = groupBy;
      scope.drillDownChart.varianceQuery.filters.push(filter);

      VarianceService.getVarianceTableByCostQueries([scope.drillDownChart.query, scope.drillDownChart.varianceQuery])
      .then(function (varianceTable) {
        scope.drillDownChart.data = varianceTable;
      });
    }

    function removeDrilldownChart(element) {
      d3.select(element).selectAll(".drilldown-chart").remove();
    }

    function removeDetail(element) {
      var ele = d3.select(element);

      ele.select("table#consumption-units").remove();
      ele.select("div.cu").select("table").select("*").remove();
      ele.select("div.cu").select("table").select("thead").remove();
      ele.select("div.cu").select("table").select("tbody").remove();

      d3.select(".cu-header").classed("hidden", true);
    }

    return {
      enableDrilldown: enableDrilldown,
      disableDrilldown: disableDrilldown,
      addDrilldownChart: addDrilldownChart,
      addItrsTable: addItrsTable,
      addDetail: addDetail,
      removeDetail: removeDetail,
      removeDrilldownChart: removeDrilldownChart,
      hideItrsTable: hideItrsTable
    }
  }]);
