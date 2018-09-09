/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

/* eslint-disable */
/* prettier-ignore */

angular
  .module('pages.cost-flow', ['ngRoute', 'utils.events', 'utils.constants'])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/cost-flow', {
        templateUrl: 'legacy/pages/cost-flow/cost-flow.html',
        controller: 'legacyCostFlowCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'cost-flow',
      });
    },
  ])
  .controller('legacyCostFlowCtrl', [
    'events',
    '$scope',
    '$route',
  '$rootScope',
  'CostQueryParameter', 'ReportService', 'settingsService', 'ReportListService', 'CONSTANTS.EVENTS',
    function(events, $scope, $route, $rootScope, costQueryParameter, ReportService, settingsService, ReportListService, EVENTS) {

      $scope.currentSnapshot = {};
      $scope.dashboardSource = "";
      // $scope.topNav = ReportListService.getList("costAnalytics", 3);

      $scope.dashboardClassification = "GENERAL_LEDGER";

      $scope.output = settingsService.getPrimaryOutput();
      if (!$scope.output) {
          $scope.currentSnapshot = null;
          return;
        }
      $scope.currentSnapshot = $scope.output.instanceId;

      var glQuery;

      /*
          sankey issues:
            contracts_id,* isn't purged upon removing the level
            org cap
       */

      function getAmount() {
        ReportService.getCosts(glQuery).then(function (stats) {
          console.log(stats);
          glQuery.getTotal = false
          $scope.amount = "£" + d3.format(",.0f")(stats.data.amount.sum);
        });
      }

      function createComponents() {
        $scope.costQuery = costQueryParameter.createNew("GENERAL_LEDGER", $scope.dashboardSource, [], 'total', undefined, undefined, $scope.currentSnapshot);

        $scope.component = {
          id: 0, width: 12, zoomable: false,
          type: "sankey",
          name: "Cost Flow",
          subtitle: "Sankey diagram showing flow of costs through stages of the cost model.",
          height: "full",
          filters: [],
          groupBy: {all: [], selected: []},
          sourceGrouping: {all: [], selected: {}},
          data: null,
          dynamicSource: true,
          tableEnabled: true,
          chartToggle: false,
          query: $scope.costQuery,
          filterOptions: [
            { groupBy: "SourceLegalEntity", label: "Source Legal Entity", all: []},
            { groupBy: "TargetLegalEntity", label: "Target Legal Entity", all: []},
            { groupBy: "CostCentre", label: "Cost Centre", all: []},
            { groupBy: "Vendor", label: "Vendor", all: []}
          ]
        };

        console.log('$scope.costQuery',$scope.costQuery);

        //
        // ReportService.updateComponent($scope.component, $scope.costQuery, $scope.dashboardSource);
      }

      function init() {
        if (!$scope.currentSnapshot) {
          return;
        }

        glQuery = costQueryParameter.createNew($scope.dashboardClassification, null, [], undefined, undefined, undefined, $scope.currentSnapshot);

        getAmount();
        createComponents();
      }

      const onOutputChange = () => {
        //$scope.currentSnapshot = ReportService.getCurrentDimensionSnapshot();
        $scope.currentSnapshot = null;
        setTimeout(()=>{
          $scope.output = settingsService.getPrimaryOutput();
          if (!$scope.output) {
            $scope.currentSnapshot = null;
          return;
        }
          $scope.currentSnapshot = $scope.output.instanceId;
          init();
          $scope.$digest();
        },0)
      };

      events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
        $scope.$on('$destroy', () => {
          events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
        });

      $scope.$on('updateSankey', function(event, data) {
        update(data);
      });

      $scope.$on('changeSankeyFilter', function() {
        // commented out as I can't see where it is updating the filters right now.
        // plus it is disabled.
        // d3.select("see-chart").select(".loading").classed("hidden", false);
        // ReportService.updateComponent($scope.component, $scope.costQuery, $scope.dashboardSource);
      });

      $scope.$on('removeChartSource', function() {
        resetChart();
      });

      function resetChart()
      {
        if($scope.component.groupBy.selected) {
          for(var i = 0; i < $scope.component.groupBy.selected.length; i++) {
            if($scope.component.groupBy.selected[i]) {
              $scope.component.groupBy.selected[i].activeGroupBy = null;
            }
          }

          $scope.component.sourceGrouping.selected.activeGroupBy = null;
        }

        $scope.dashboardSource = [];
        $scope.costQuery.groupBy = $scope.dashboardSource;
        $scope.component.groupBy.selected = [];
        $scope.component.sourceGrouping.selected = {};

        $scope.component.filters = [];
        $scope.loadedGroupBys = [];

        ReportService.updateComponent($scope.component, $scope.costQuery, $scope.dashboardSource);
      }

      //TODO: Naming - groupBy and groupby v.confusing.
      function update(data) {
        d3.select("see-chart").select(".loading").classed("hidden", false);
        var base = setUpNewQueryBase(data);

        var masterFilter = base.masterFilter;
        var classificationIdx = base.classificationIdx;

        var availableGroupBys = [];   // list of available groupBy (determined from selected levels of sankey).

        // Get filter groupBy params;
        for(var i = 0; i < data.selectedLevels.length; i++) {

          // disable nominal filtering for now, causes performance issues.
          var levelMap = data.selectedLevels[i].groupBy
          .filter(function(d){ return (d.disabled !== true); })
          .map(function(d){ return d.value });

          availableGroupBys = availableGroupBys.concat(levelMap);
        }

        // filter list (format { groupBy: x, all: [] }. All format { name: y, selected: false };
        $scope.component.filters = $scope.component.filters || [];
        $scope.loadedGroupBys = [];       //uniques tracker.
        $scope.component.masterFilters = [];

        // if STAFF, NON_STAFF, OTHER is selected a master filter is applied.
        if(classificationIdx[0] > -1) {
          var filterIdx = $scope.component.filters.map(function(d){ return d.groupBy; }).indexOf(masterFilter[0].groupBy);
          if(filterIdx === -1) {
            $scope.component.masterFilters.push(masterFilter[0]);
          }
        }

        if(classificationIdx[1] > -1) {
          var filterIdx2 = $scope.component.filters.map(function(d){ return d.groupBy; }).indexOf(masterFilter[1].groupBy);
          if(filterIdx2 === -1) {
            $scope.component.masterFilters.push(masterFilter[1]);
          }
        }

        // apply filters (currently disabled)
        availableGroupBys.forEach(function(item){
          if(item !== "") {
            var filterQueryCopy = copyQuery(item);

            if(checkIsNewFilter(item)) {
              // ReportService.getFilters(filterQueryCopy).then(function(data) {
              //   var exisitingFiltersIdx = $scope.component.filters.map(function(d){ return d.groupBy}).indexOf(filterQueryCopy.target);
              //   var exisitingFilters = $scope.component.filters[exisitingFiltersIdx];
              //
              //   if(exisitingFiltersIdx > -1) {
              //     $scope.component.filters[exisitingFiltersIdx] = { groupBy: filterQueryCopy.target, all: processFilters(data, exisitingFilters) };
              //   }
              //   else {
              //     $scope.component.filters.push({ groupBy: filterQueryCopy.target, all: processFilters(data) });
              //   }
              //
              //   bindFilterDropdownClick();
              // });
            }
          }
        });

        // ReportService.updateComponent($scope.component, $scope.costQuery, $scope.dashboardSource);

        $scope.component.query = $scope.costQuery;

        $scope.$broadcast('getNewDataForComponent', $scope.component);
        watchFilterLoadComplete(availableGroupBys);
      }

      // find instance of level and get groupby for it.
      function createMasterFilter(data, id) {
        // find instance of lv2 (STAFF, NON_STAFF, OTHER).
        var classificationIdx = data.selectedLevels.map(function(o){ return o.level }).indexOf(id);

        var masterFilter = { groupBy: null, all: [{ name: "*", selected: true }] };

        if(classificationIdx && classificationIdx > -1) {
          masterFilter.groupBy = data.selectedLevels[classificationIdx].masterFilter;
        }
        else if(id === 4) {
          // if level not found, fall down to second level of infrastructure
          // TODO: consider further levels of infrastructure
          classificationIdx = data.selectedLevels.map(function(o){ return o.level }).indexOf(5);

          if(classificationIdx && classificationIdx > -1) {
            masterFilter.groupBy = data.selectedLevels[classificationIdx].masterFilter;
          }
        }

        return { filter: masterFilter, idx: classificationIdx};
      }

      // determine CostQueryParameter setup
      function setUpNewQueryBase(data)
      {
        // Modified from https://jsfiddle.net/45c5r246/34/
        var maxLevel = Math.max.apply(Math,data.selectedLevels.map(function(o){return o.level;}));
        var maxRow = data.selectedLevels.find(function(o){ return o.level === maxLevel; });

        var master1 = createMasterFilter(data, 2);  // find instance of lv2 (STAFF, NON_STAFF, OTHER).
        var master2 = createMasterFilter(data, 4);  // find instance of lv4 (INFRA).

        var groupBy = [];

        for (var i = 0; i < data.selectedLevels.length; i++) {
          if (!data.selectedLevels[i].activeGroupBy) {
            data.selectedLevels[i].activeGroupBy = data.selectedLevels[i].groupBy[0];
          }

          groupBy.push(data.selectedLevels[i].activeGroupBy.value);
        }

        $scope.costQuery = costQueryParameter.createNew(maxRow.name, groupBy, [], 'total', undefined, undefined, $scope.currentSnapshot);

        return {
          masterFilter:       [ master1.filter, master2.filter],
          classificationIdx:  [ master1.idx,    master2.idx]
        }
      }

      // copy query for filter request (change target). Possibly unneeded now.
      function copyQuery(newTarget)
      {
        var filterQueryCopy = angular.copy($scope.costQuery);
        filterQueryCopy.target = newTarget;

        return filterQueryCopy;
      }

      // check if filter is already in array
      function checkIsNewFilter(newFilterGroup)
      {
        var isNewList = ($scope.loadedGroupBys.indexOf(newFilterGroup) === -1);
        $scope.loadedGroupBys.push(newFilterGroup);

        return isNewList;
      }

      // format filters for request
      function processFilters(filterList, exisitingFilters)
      {
        //persist filters
        if(exisitingFilters) {
          filterList = filterList.plain();

          var keys = Object.keys(filterList);

          //Remove filters that have not been returned by the server
          var i = exisitingFilters.all.length;

          while(i--) {
            if(keys.indexOf(exisitingFilters.all[i].name) === -1) {
              exisitingFilters.all.splice(i, 1);
            }
          }

          //Add filters that have been added(/restored) by the server
          for(var filter in filterList) {
            if(exisitingFilters.all.map(function(d){ return d.name }).indexOf(encodeURIComponent(filterList[filter])) === -1) {
              exisitingFilters.all.push({ name: encodeURIComponent(filterList[filter]), selected: false });
            }
          }

          return exisitingFilters.all;
        }
        else {
          var plainFilter = filterList.plain();
          var outputArr = [];

          for(var x in plainFilter) {
            outputArr.push({ name: encodeURIComponent(x), selected: false });
          }

          return outputArr;
        }
      }

      // Stops filter menu collapsing on clicking inside the menu
      function bindFilterDropdownClick()
      {
        //TODO: refactorable, for sure. Called way too many times currently.
        // but if out of the async req it's called too early
        angular.element('.filters').find('.dropdown-menu')
        .on('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
        });
      }

      // Stops filter menu collapsing after expanding/collapsing internal dropdown
      function watchFilterLoadComplete(filters)
      {
        //seems heavy duty for quite a small task;
        $scope.$watch(function() { return angular.element('.filters').find('.panel-heading').length}, function(newValue, oldValue) {
          if(newValue === filters.length)
          {
            angular.element('.filters').find('.panel-heading')
            .on('click', function (event) {
              event.preventDefault();
              event.stopPropagation();
              $($(this).data('parent')).find('.panel-collapse.in').collapse('hide');
              $($(this).attr('href')).collapse('toggle');
            });
          }
        });
      }

      init();

  }]);
