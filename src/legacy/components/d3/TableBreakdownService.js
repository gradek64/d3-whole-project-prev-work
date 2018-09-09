/**
 * Created by joshrayman on 26/04/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app')
.service('TableBreakdownService', [ 'DrilldownChartService', function(DrilldownChartService) {
  function init(scope, element) {
    var headers = [
      [null, null, "Data Centre ID", "Location", "Floor", "Rack Number", "Make", "Model", "Platform", "Operating System", "Memory", "Environment", "Amount"],
      [null, null, "Serial Number", "Server ID", "Amount"] //, "Used Capacity", "Allocated Storage"
    ];

    var lookups = [
      [null, "data_centre_id", "Location", "Floor", "RackNumber", "Make", "Model", "Platform", "OperatingSystem", "Memory", "Environment"],
      [null, "SerialNumber", "servers_id"] //, "UsedCapacity", "AllocatedStorage"]
    ];

    var groupbys = [[
      { "name": "Environment Type", "groupBy": "Environment"},
      { "name": "Operating System", "groupBy": "OperatingSystem"},
      { "name": "Make", "groupBy": "Make"},
      { "name": "Model", "groupBy": "Model"},
      { "name": "Location", "groupBy": "Location"}
    ],[
      { "name": "Environment Type", "groupBy": "Environment"},
      { "name": "Operating System", "groupBy": "OperatingSystem"},
      { "name": "Location", "groupBy": "Location"}
    ]];

    scope.selectedHeaders = headers[0];
    scope.selectedLookups = lookups[0];
    scope.selectedGroupbys = groupbys[0];

    scope.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    scope.changeBreakdownChart = function() {
      scope.chartInfo.toggleTable = !scope.chartInfo.toggleTable;

      if(scope.chartInfo.toggleTable) {
        scope.chartInfo.type = "table-breakdown";

        setTimeout(function(){
          renderTable(scope, element);
        }, 100);
      } else {
        var mapInfo = angular.copy(scope.chartInfo);
        mapInfo.type = "map";
        mapInfo.disableHeader = true;
        scope.mapInfo = mapInfo;

        var ele = angular.element(element).find("see-chart");
        $compile(ele)(scope);
      }
    };

    scope.changeTab = function(tab) {
      scope.chartInfo.selectedTab = tab;
      scope.chartInfo.masterFilters = [ tab ];

      scope.selectedHeaders = (tab.tabName === 'Server') ? headers[0] : headers[1];
      scope.selectedLookups = (tab.tabName === 'Server') ? lookups[0] : lookups[1];
      scope.selectedGroupbys = (tab.tabName === 'Server') ? groupbys[0] : groupbys[1];

      if(scope.chartInfo.toggleTable) {
        setTimeout(function(){
          renderTable(scope, element);
        }, 100);
      }
    };

    scope.changeBreakdown = function(breakdown) {
      scope.chartInfo.selectedBreakdown = breakdown;
      scope.chartInfo.query.groupBy = breakdown.groupBy;

      setTimeout(function(){
        renderTable(scope, element);
      }, 100);
    };
    /*

    {
     "dimensionSnapshotUuid":"acbaf013-7950-4acd-8da2-23618cc20edc",
     "baseGroup":"Location,servers_id",
     "uniqueValueFields":"servers_id",
     "metricValueFields":"amount",
     "filters":["classification,ITS"]
     }

     */
    scope.$on('renderBreakdownTable', function() {
      setTimeout(function() {
        renderTable(scope, element);
      }, 100);
    });
  }

  function renderTable(scope, element) {
    scope.chartInfo.breakdowns = scope.selectedGroupbys;

    var drillDownInfo = {
      headers: scope.selectedHeaders,
      lookups: scope.selectedLookups,
      baseGroup: scope.chartInfo.selectedBreakdown.groupBy
    };

    drillDownInfo.headers[0] = scope.chartInfo.selectedBreakdown.name;

    drillDownInfo.headers[1] = scope.chartInfo.selectedTab.tabName;
    drillDownInfo.lookups[0] = scope.chartInfo.selectedTab.groupBy;

    var table = d3.select(element[0]).select("#table-holder");

    table.selectAll("*").remove();
    table.select("thead").remove();
    table.select("tbody").remove();


    DrilldownChartService.addDetail(scope, null, table, scope.chartInfo.drilldownParent, drillDownInfo);
  }

  return {
    type: "table-breakdown",
    init: init,
    render: renderTable
  };
}]);
