'use strict';

/* eslint-disable */
/* prettier-ignore */

angular.module('legacy.services.report-service', [
    'legacy.services.costs-service-for-Legacy-code'])
.service('ReportService', [
    'ChartDataFactory',
  'TableDataService',
  '$q',
  'CostQueryParameter',
  'CostsServiceForLegacyCode',
  function(ChartDataFactory,
           TableDataService,
           $q,
           CostQueryParameter,
           CostsServiceForLegacyCode) {

    function getReport(reportId) {
      return RestangularService.one('/processor/reports/' + reportId).get();
    }

    function getReports() {
      return RestangularService.all('/processor/settings/reports').getList();
    }

    var deleteReport = function(report) {
      return RestangularService.one('/processor/settings/reports').delete(report);
    };

    var editReport = function(payload) {
      return RestangularService.one('/processor/settings/reports').customPUT(payload);
    };

    var createReport = function(payload) {
      return RestangularService.one('/processor/settings/reports').customPOST(payload);
    };

    var getDimensions = function() {
      return RestangularService.all('/processor/dimensions').getList();
    };

    var setDefaultDimension = function(id) {
      return RestangularService.one('/processor/dimensions/' + id + "/default").post();
    };

    var setCurrentDimensionSnapshot = function(dimensionSnapshot) {
      localStorageService.set('dimensionSnapshot', dimensionSnapshot);
    };

    var getCurrentDimensionSnapshot = function() {
      return localStorageService.get('dimensionSnapshot');
    };

    var setSecondarySnapshot = function(dimensionSnapshot2) {
      localStorageService.set('dimensionSnapshot2', dimensionSnapshot2);
    };

    var getSecondarySnapshot = function() {
      return localStorageService.get('dimensionSnapshot2');
    };

    function updateFilters(costQueryParameter) {

      if(Array.isArray(costQueryParameter.filters) && costQueryParameter.filters.length > 0) {
        for(var i = 0; i < costQueryParameter.filters.length; i++) {
          // catch legacy filters
          if(typeof costQueryParameter.filters[i] === 'string') {
            costQueryParameter.filters[i] = costQueryParameter.filters[i];
          } else {
            costQueryParameter.filters[i] = costQueryParameter.filters[i].field + "," + costQueryParameter.filters[i].value;
          }
        }
      }

    }

    var formatQuery = function(query) {
      var costQueryParameter = angular.copy(query);

      costQueryParameter = CostQueryParameter.update(costQueryParameter);

      if(costQueryParameter.groupBy && Array.isArray(costQueryParameter.groupBy)){
        costQueryParameter.groupBy = costQueryParameter.groupBy.join();

        if(costQueryParameter.groupBy === "," || costQueryParameter.groupBy === "") {
          costQueryParameter.groupBy = null;
        }
      }

      updateFilters(costQueryParameter);

      costQueryParameter.filters[costQueryParameter.filters.length] = "classification," + costQueryParameter.classification.value;

      if(Array.isArray(costQueryParameter.nestedFilters) && costQueryParameter.nestedFilters.length > 0) {
        for(var i = 0; i < costQueryParameter.nestedFilters.length; i++) {
          costQueryParameter.nestedFilters[i] = costQueryParameter.nestedFilters[i].field + "," + costQueryParameter.nestedFilters[i].value;
        }
      }

      if(!costQueryParameter.nestedFilters) {
        costQueryParameter.nestedFilters = [];
      }

      if(!costQueryParameter.nestedGroupBy || costQueryParameter.hasNestedGroupBy === false) {
        costQueryParameter.nestedGroupBy = [];
      }

      return costQueryParameter;
    };

    var getCosts = function(costQueryParameter) {
      var type = costQueryParameter.typeForMock;
      costQueryParameter = formatQuery(costQueryParameter);

      // if (costQueryParameter.type === 'histogram') {
      //   return RestangularService.one('/processor/costs/histogram').customPOST(costQueryParameter);
      // }
      //
      // return RestangularService.one('/processor/costs').customPOST(costQueryParameter);

      costQueryParameter.typeForMock = type;
      return CostsServiceForLegacyCode.getAll(costQueryParameter).then(function(res) {
        res.plain = function() {return res.data;}
        return res;
      });

      // console.log('costQueryParameter', costQueryParameter)
    };

    var getNestedCosts = function(costQueryParameter) {
      return RestangularService.one('/processor/costs/nested').customPOST(costQueryParameter);
    };

    var getFilters = function(payload)
    {
      var costQueryParameter = formatQuery(payload);

      return RestangularService.one('/processor/costs/filters').customPOST(costQueryParameter);
    };

    /**
     *
     * Call to update a report directive
     *
     * @param comp component, needs the uuid inside with the dimensionId, also needs the type of graph
     * @param filterStr 'literal representation that goes inside the query'
     * @param dashboardSource
     */
    var updateComponent = function(comp, rootQuery, dashboardSource, getFlatTableData, snapshot) {
      if(!rootQuery) {
        rootQuery = comp.query;
      }

      // if(costQueryParameter.nested) {
      //   getNestedData(comp, costQueryParameter);
      // } else {
      if(rootQuery) {
        return getRegularData(comp, rootQuery, dashboardSource, getFlatTableData, snapshot);
      }
      // }
    };

    function getNestedData(comp, costQueryParameter) {
      getNestedCosts(costQueryParameter).then(function (data) {
        var plainData = data.plain();

        var processed = ChartDataFactory.processNested(plainData, comp);

        comp.data = processed.data;
        comp.tableData = processed.tableData;
      });
    }

    function getDataByQuery(comp,costQueryParameter){
      return getRegularData(comp, costQueryParameter);
    }

    function getRegularData(comp, costQueryParameter, dashboardSource, getFlatTableData, snapshot) {
      return $q(function(resolve, reject){


        var getData = true;

        if (comp.type === "sankey" && !comp.dynamicSource) {
          if (!comp.sankeyClassification || !comp.sankeyClassification.selected || dashboardSource === comp.sankeyClassification.selected.groupby) {
            console.log("sankey error");
            getData = false;
          }
        }

        //restrict filters to just Cost Flow for now - seem to be two partly designed systems,
        //one at cost parameter level, one at component level.
        if (comp.type === "sankey") {
          addSankeyFilters(comp, costQueryParameter);
        }

        costQueryParameter = addMasterFilter(comp, costQueryParameter);

        // (FIX BUG) update report-components when changing the output
        if(snapshot !== undefined && snapshot.dimensionSnapshotUuid) {
          costQueryParameter.dimensionSnapshotUuid = snapshot.dimensionSnapshotUuid;
        }

        if (getData) {
          costQueryParameter.typeForMock = comp.type;
          getCosts(costQueryParameter).then(function (data) {
            var plainData = data.plain();

            //new format for process data
            var processDataObj = {
              plainData : plainData,
              type      : comp.type,
              accessor  : costQueryParameter.accessor,
              interval  : costQueryParameter.interval || "year",
              showUnits : comp.showUnits,
              target    : costQueryParameter.target,
              isOrdinal : (comp.axisInfo && comp.axisInfo.xType === 'ordinal')
            };

            if(getFlatTableData) {
              // costPotService.getAllCostPots(snapshot.dimension.id).then(function (costPots) {
              //   comp.flatData = comp.flatData || {};
              //   comp.flatData.costPots = costPots;
              //
              //   //new format for process data
              //   processDataObj.isCostFlow = false;
              //   processDataObj.flatData = comp.flatData;
              //
              //   var processed = ChartDataFactory.processData(processDataObj);
              //
              //   comp.data = processed.data;
              //   comp.tableData = processed.tableData;
              //   resolve(processed);
              //
              // });
            }
            else {
              var processed = ChartDataFactory.processData(processDataObj);

              comp.data = processed.data;
              comp.tableData = processed.tableData;

              resolve(processed);
            }
            comp.show = true;
          });
        } else {
          reject(new Error("No Data"));
        }
      });
    }

    function addSankeyFilters(comp, costQueryParameter) {
      var outputFilters = [];

      if (comp.filters) {
        for (var i = 0; i < comp.filters.length; i++) {
          var selected = comp.filters[i].all.filter(function (d) {
            if (d.selected === true) {
              return d.name;
            }
          });

          if (selected.length > 0) {
            var outputString = comp.filters[i].groupBy + ",";

            for (var j = 0; j < selected.length; j++) {
              outputString += encodeURIComponent(selected[j].name) + ",";
            }

            outputString = outputString.slice(0, outputString.length - 1);
            outputFilters.push(outputString);
          }
        }

        costQueryParameter.filters = costQueryParameter.filters.concat(outputFilters);
      }
    }

    var updateTableComponent = function(comp, rootQuery, dashboardSource, snapshot) {
      updateComponent(comp, rootQuery, dashboardSource, true, snapshot);
    };

    var getCurrentUUID = function () {
      // /processor/dimensions returns dimensionSnapshotId;
      // /wrangler/dimensions returns dimensionSnapshotUuid
      return null;
      // return (localStorageService.get('dimensionSnapshot')) ? localStorageService.get('dimensionSnapshot').dimensionSnapshotUuid : null;
    };

    var getFlatData = function(payload) {
      payload.dimensionSnapshotUuid = getCurrentUUID();

      updateFilters(payload);

      return RestangularService.one('/processor/costs/table').customPOST(payload);
    };

    function addMasterFilter(comp, costQueryParameter) {
      // add master filters - used at STAFF/NON_STAFF/OTHER level to filter data and infra for each costpot
      if (comp.masterFilters && comp.masterFilters.length > 0) {
        for (var i = 0; i < comp.masterFilters.length; i++) {
          var outputString = { field: comp.masterFilters[i].groupBy, value: "*" };

          // avoid adding multiple times to arr. on subsequent requests.
          if(costQueryParameter.filters.length === 0) {
            costQueryParameter.filters.push(outputString);
          }
          else if(costQueryParameter.filters[costQueryParameter.filters.length - 1].value === "*") {
            costQueryParameter.filters[costQueryParameter.filters.length - 1] = outputString;
          }
          else {
            costQueryParameter.filters.push(outputString);
          }
        }
      }

      return costQueryParameter;
    }

    // this is my starting point towards a centralised data gatherer for charts.
    function getChartData(chartInfo) {
      var costQueryParameter = angular.copy(chartInfo.query);

      costQueryParameter = addMasterFilter(chartInfo, costQueryParameter);

      costQueryParameter.typeForMock = chartInfo.type;
      return getCosts(costQueryParameter);
    }

    return {
      getReport: getReport,
      getReports: getReports,
      deleteReport: deleteReport,
      editReport: editReport,
      createReport: createReport,
      getDimensions: getDimensions,
      setDefaultDimension: setDefaultDimension,
      getCosts: getCosts,
      getFilters: getFilters,
      getFlatData: getFlatData,
      updateComponent: updateComponent,
      updateTableComponent: updateTableComponent,
      getCurrentDimensionSnapshot: getCurrentDimensionSnapshot,
      setCurrentDimensionSnapshot: setCurrentDimensionSnapshot,
      setSecondarySnapshot:setSecondarySnapshot,
      getSecondarySnapshot:getSecondarySnapshot,
      getChartData: getChartData,
      getDataByQuery: getDataByQuery
    }
  }]);
