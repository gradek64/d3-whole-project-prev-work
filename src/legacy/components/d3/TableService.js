/**
 * Created by joshrayman on 05/04/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('TableService', ['$location', 'ChartDataFormat', 'ReportService', 'ChartDataFactory', 'TableMathsService',
  function($location, ChartDataFormat, ReportService, ChartDataFactory, TableMathsService) {

    function addHeaders(table, headers, scope, hide) {
      var colCount = scope.chartInfo.headers.length;

      table.append("thead")
      .attr("style", function() { return hide ? "visibilty: none": ""})
      .attr("class", "header")
      .append("tr").selectAll("td")
      .data(headers)
      .enter()
      .append("td")
      .attr("width", function(d){
        if(scope.chartInfo.type === 'table') {
          if(d === "Percentage" || d === "Total" || d === "Count") {
            return "10%";
          }
          else {
            return 80 / colCount + "%";
          }
        }
      })
      .append("div").attr("class", "btn-group")
      .selectAll("span")
      .data(function(d) { return Array.isArray(d) ? d : [d]; })
      .enter()
      .append("span")
      .attr("class", function(d, i) {
        if(this.parentNode.children.length > 1) {
          if (scope.tableData.isDefault) {
            return (i === 0) ? "btn btn-primary" : "btn btn-default";
          }
          else {
            return (i === 1) ? "btn btn-primary" : "btn btn-default";
          }
        }
      })
      .on("click", function(d, i) {

        //----------------------------------------------------------------------//
        //
        //      Departmental Consumption Service Name/Service Group toggle
        //
        //  This is fed an array of strings, if d3 picks up an array instead of
        //  a string, then it falls into this behaviour.
        //
        //----------------------------------------------------------------------//

        if(this.parentNode.children.length > 1) {
          var data = { isDefault: (i === 0) };

          scope.tableData.isDefault = data.isDefault;

          table.select("thead").selectAll("span")
          .attr("class", function(d, i){
            if(this.parentNode.children.length > 1) {
              if (data.isDefault) {
                return (i === 0) ? "btn btn-primary" : "btn btn-default";
              }
              else {
                return (i === 1) ? "btn btn-primary" : "btn btn-default";
              }
            }
          });

          scope.$emit("changeTableData", data);
        }
      })
      .text(function (d) {
        return d;
      });
    }

    function addSingleCell(info, scope) {
      info.row
      .append("td")
      .html(function() {
        if(info.isRoot)
          return info.level;
        else if(!info.target) {
          var vals = info.data.uniqueValues[info.level];

          if (Array.isArray(vals)) {
            var displayStr = "";
            for(var i = 0; i < vals.length; i++) {
              displayStr += vals[i] + "<br>";
            }
            return displayStr;
          } else {
            return vals;
          }
        }
        else {
          if(info.data[info.target] && info.data[info.target][info.accessor] && info.data[info.target][info.accessor][info.metric]) {
            return ChartDataFormat.formatNumber(info.data[info.target][info.accessor][info.metric]);
          }
        }
      })
    }

    function cellOnClick(d, info, scope) {
      if(info.enableConsumptionUnits) {
        // consumption units
        info.onClick(scope, d);
      }
      else if(info.enableDrilldown) {
        if(scope.tableData.isDefault) {
          // click through to new report
          goToSelectedPath(d.level1, d.level2, info.scope);
        }
        else {
          scope.selectedGroup = d.level2;

          var filter = [
            "ServiceType," + d.level1,
            "ServiceGroup," + d.level2
          ];

          //TODO: incredibly hard coded - need to fix in future.
          //restrict to dept. consumption only - it cost overview does not need the additional filters.
          if(scope.chartInfo.legalEntitySelected && scope.chartInfo.departmentSelected) {
            filter = [
              "SourceLegalEntity," + scope.chartInfo.legalEntitySelected.name,
              "TargetCostCentre," + scope.chartInfo.departmentSelected,
              "ServiceType," + d.level1,
              "ServiceGroup," + d.level2
            ];
          }

          openGroupListModal(filter, scope);
        }
      }
    }

    function addCell(info, scope)
    {
      var uniques = [];

      console.log(info.level);

      var row = info.row;

      if(!scope.chartInfo.varianceTable) {
        row = info.row
        .filter(function(d){
          if(uniques.indexOf(d[info.level]) === -1 || d[info.level] === "" || info.lowestLvl)
          {
            uniques.push(d[info.level]);
            return d;
          }
        })
      } else {
        info.row
        .attr("class", function(d) { return (d.output1 === null || d.output2 === null) ? "grey" : "white"; })
      }

      var cell = row.append("td")
      .attr("class", function(d) {
        return (d["level1"] === "Total" ? "totalRow " : "") + ((info.enableDrilldown) ? info.level + " pointer" : info.level);
      })
      .attr("rowspan", function(d){
        if(d[info.level] === "" || info.lowestLvl || scope.chartInfo.varianceTable )
        { return 1; }
        else
        { return info.data.filter(function(e){ return (e[info.level] === d[info.level]); }).length; }
      })
      .on("click", function(d) { return cellOnClick(d, info, scope) });

      if(info.modal) {
        cell.on("click", function(d){
          if(info.scope)
          {
            info.scope.selectedUnits = d.detail;
            info.scope.$digest();

            var isOpen = d3.select('#detail').classed("side-open");
            d3.select('#detail').classed("side-open", !isOpen);
            d3.select('#table').classed("side-open", !isOpen);
          }
        });
      }

      cell.append("span").text(function(d) { return ChartDataFormat.formatVarianceSpanText(d, info.level, info.isNumber); });
    }

    var goToSelectedPath = function(a, b, scope)
    {
      $location.path("/reports/it-service-statement/" + a + "/" + b);
      scope.$apply();
    };

    function openGroupListModal(filter, scope)
    {
      var id = scope.chartInfo.type + '-' + scope.chartInfo.id;
      angular.element("#" + id + "-table").modal("show");

      var payload = angular.copy(scope.chartInfo.query);

      payload.groupBy = ["ServiceName"];
      payload.filters = filter;

      ReportService.getCosts(payload).then(function(data){
        scope.selectedTable.tableData = ChartDataFactory.processTable(data.plain(), payload.target, payload.accessor);

        console.log(scope.selectedTable.tableData);
      });
    }

    function bindUpdateVarianceEv(scope) {
      scope.$on("updateVariance", function(ev, primarySnapshot, secondarySnapshot) {
        console.log("rec updateVariance (table)", primarySnapshot, secondarySnapshot);

        scope.chartInfo.query.dimensionSnapshotUuid = primarySnapshot.dimensionSnapshotUuid;

        scope.chartInfo.varianceQuery = angular.copy(scope.chartInfo.query);
        scope.chartInfo.varianceQuery.dimensionSnapshotUuid = secondarySnapshot.dimensionSnapshotUuid;

        VarianceService.getVarianceTableByCostQueries([scope.chartInfo.query, scope.chartInfo.varianceQuery])
        .then(function (varianceTable) {

          for(var i = 0; i < varianceTable.length; i++) {
            var getMockData = false;

            // mock variance
            if(getMockData) {
              varianceTable[i].output2 = varianceTable[i].output2 + ((Math.random() - 0.5) * 20000);
            }

            varianceTable[i].variance = varianceTable[i].output2 - varianceTable[i].output1;
          }

          scope.chartInfo.data = varianceTable;
          scope.chartInfo.tableData = varianceTable;
          render(scope, scope.chartInfo.data, element);
        });
      });
    }

    function init(scope, element)
    {
      scope.ReportService = ReportService;

      scope.margin = {top: 0, right: 0, bottom: 0, left: 0};
      scope.header = 90;

      var dt = d3.select(element[0]).select(".canvas"); //.select("div.data-table");

      scope.headerTable = dt.select(".mtHeader").select("table");     // main table (header)
      scope.table = dt.select(".mt").select("table");                 // main table (body - for fixed/sticky header
      scope.cuTable = dt.select(".cu").select("table");               // consumption units table - hidden by def


      //rm if not var table
      if(scope.chartInfo.varianceTable) {
        bindUpdateVarianceEv(scope);
      }

    }

    function resize(scope, element)
    {
      // tables don't really need this.
    }

    function render(scope, chartData, element)
    {
      var data = scope.chartInfo.tableData;

      if(!data || data.length === 0) {
        throw new Error("No Data");
      }

      var table = scope.table;

      if(scope.chartInfo.varianceTable) {
        data.filter(function(d){ return d.total !== null; });

        table.classed("variance", true);
      }

      scope.headerTable.selectAll("*").remove();
      table.selectAll("*").remove();

      if(!data || data.length === 0) {
        table.style("opacity", "0");
      }
      else {
        table.transition(250).style("opacity", "1");
      }

      var headers = angular.copy(scope.chartInfo.headers);

      if(scope.chartInfo.showPercentage && headers.indexOf("Percentage") === -1) {
        headers.push("Percentage");
      }

      if(!scope.chartInfo.varianceTable && headers.indexOf("Total") === -1) {
        headers.push("Total");
      }

      //if tableData is initialised, persist - else create object.
      scope.tableData = scope.tableData || { isDefault: true };

      addHeaders(scope.headerTable, headers, scope, false);
      addHeaders(scope.table, headers, scope, true);

      var tbody = table.append("tbody");

      if(scope.chartInfo.showTotal !== false) {
        data = TableMathsService.addTotalRow(data, scope.chartInfo.type);
        scope.chartInfo.showPercentage = true;  // add total row also adds percentage data to each data row.
      }

      var row = tbody.selectAll("tr.level0")
      .data(data)
      .enter()
      .append("tr");

      var colCount = scope.chartInfo.headers.length;

      if(scope.chartInfo.varianceTable) {
        addVarianceTableCells(scope, row, data);
      } else {
        addDefaultTableCells(scope, row, data, colCount, headers);
      }

      if(scope.chartInfo.selectedUnitsHeader === "Deployment") {
        expandTable(scope, scope.chartInfo.selectedDrilldownDatum, scope.chartInfo.drilldownParent);

        var ele = d3.select(scope.table.node().parentElement.parentElement);
        ele.select("div.mt").classed("hidden", true);
      }
    }

    function addDefaultTableCells(scope, row, data, colCount, headers) {
      //Note: using indexOf("Date") is potentially risky,
      //but I can't think of an instance when that wouldn't be a date.
      var cellInfo = {
        row: row,
        level: "level1",
        modal: false,
        data: data,
        lowestLvl: false,
        isNumber: false,
        enableDrilldown: scope.chartInfo.enableDrilldown,
        scope: scope,
        isDate: (headers[0].indexOf("Date") > -1),
        width: 80 / colCount
      };

      addCell(cellInfo, scope);

      if(colCount > 1) {
        var cellInfo2 = {
          row: row,
          level: "level2",
          modal: false,
          data: data,
          lowestLvl: true,
          isNumber: false,
          enableDrilldown: scope.chartInfo.enableDrilldown,
          enableConsumptionUnits: (scope.chartInfo.isDrilldown || scope.chartInfo.enableConsumptionUnits),
          onClick: (scope.chartInfo.isDrilldown || scope.chartInfo.enableConsumptionUnits) ? expandTable : null,
          scope: scope,
          isDate: false,
          width: 80 / colCount
        };
        addCell(cellInfo2, scope);
      }

      if(colCount > 2) {
        var cellInfo3 = {
          row: row,
          level: "level3",
          modal: false,
          data: data,
          lowestLvl: true,
          isNumber: false,
          enableDrilldown: false,
          enableConsumptionUnits: (scope.chartInfo.isDrilldown || scope.chartInfo.enableConsumptionUnits),
          onClick: (scope.chartInfo.isDrilldown || scope.chartInfo.enableConsumptionUnits) ? expandTable : null,
          scope: null,
          isDate: false,
          width: 80 / colCount
        };

        addCell(cellInfo3, scope);
      }

      if(scope.chartInfo.showPercentage === true) {
        var percCell = {
          row: row,
          level: "percentage",
          modal: true,
          data: data,
          lowestLvl: true,
          isNumber: true,
          enableDrilldown: false,
          scope: null,
          isDate: false,
          width: 10
        };

        addCell(percCell, scope);
      }

      var totalCell = {
        row: row,
        level: "total",
        modal: false,
        data: data,
        lowestLvl: true,
        isNumber: scope.chartInfo.query.accessor !== "sum",
        enableDrilldown: false,
        scope: null,
        isDate: false,
        width: 10
      };

      addCell(totalCell, scope);

      if(scope.chartInfo.type === "bubble") {
        var cellInfo5 = {
          row: row,
          level: "renewal",
          modal: false,
          data: data,
          lowestLvl: true,
          isNumber: true,
          enableDrilldown: false,
          scope: null,
          isDate: false
        };

        addCell(cellInfo5, scope);
      }

      if (scope.chartInfo.showUnits === true) {
        var cellInfo7 = {
          row: row,
          level: "units",
          modal: false,
          data: data,
          lowestLvl: true,
          isNumber: true,
          enableDrilldown: true,
          scope: null,
          isDate: false
        };

        addCell(cellInfo7, scope);
      }
    }

    function addVarianceTableCells(scope, row, data) {
      var colCount = scope.chartInfo.lookups.length;

      for(var i = 0; i < colCount; i++) {
        var cellInfo = {
          row: row,
          level: scope.chartInfo.lookups[i],
          modal: false,
          data: data,
          lowestLvl: false,
          isNumber: (scope.chartInfo.lookups[i] !== 'name'),
          enableDrilldown: false,
          scope: scope,
          isDate: false,
          width: 80 / colCount
        };

        addCell(cellInfo, scope);
      }
    }

    function expandTable(scope, d, drilldownParent) {
      if(!drilldownParent) {
        drilldownParent = d.level1;
      }

      var ele = d3.select(scope.table.node().parentElement.parentElement);
      var mainTableDiv = ele.select("div.mt");
      var mainTableHeaderDiv = ele.select("div.mtHeader");
      var cuTableDiv = ele.select("div.cu");

      var isCollapsed = ele.select("div.mt").classed("min");

      if(isCollapsed) {
        d3.select(".cu-header").classed("hidden", isCollapsed);
        cuTableDiv.classed("hidden", isCollapsed);
      }

      mainTableDiv.classed("min", !isCollapsed);
      mainTableHeaderDiv.classed("min", !isCollapsed);
      cuTableDiv.classed("open", !isCollapsed);

      scope.cuTable.select("*").remove();

      //accounts for mt animation ev
      setTimeout(function() {
        if(!isCollapsed) {
          d3.select(".cu-header").classed("hidden", isCollapsed);
          cuTableDiv.classed("hidden", isCollapsed);
        }

        DrilldownChartService.addDetail(scope, d, scope.cuTable, drilldownParent, { type: "regular" });

      }, 550);
    }

    return {
      type: "table",
      addHeaders: addHeaders,
      addCell: addCell,
      addSingleCell: addSingleCell,
      init: init,
      render: render,
      resize: resize
    }

  }]);
