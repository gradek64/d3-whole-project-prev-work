/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

/* eslint-disable */
/* prettier-ignore */

angular
  .module('pages.kpi', ['ngRoute', 'utils.events', 'utils.constants'])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/kpi', {
        templateUrl: 'legacy/pages/kpi/kpi.html',
        controller: 'legacyKpiCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'kpi',
      });
    },
  ])
  .controller('legacyKpiCtrl', [
    'events',
    '$scope',
    '$route',
    'CostQueryParameter', 'ReportService', 'ReportListService', 'settingsService', 'levelsService', 'costsService','CONSTANTS.EVENTS',
    function(events, $scope, $route, costQueryParameter, ReportService, ReportListService, settingsService, levelsService, costsService, EVENTS) {
      /*************** Init variables ***********************/
      // $scope.topNav = ReportListService.getList("boardMetrics");

     
      //const configUuid = '91970c2e-271b-4f1b-af2a-adb5d5a298d7';

      //working output NormalPathScenarioJob11523458293;

      //get level for KPI which infrustructure 1
       // levelsService.getAll(configUuid, undefined, 'model-srv')
       // .then( (res) => res.data.find( (e)=> e.name === 'Infrastructure 1'))
       // .then((level)=>{
       //  console.log('level.id',level.id);
       //    return costsService.getAll(configUuid,level.id,{"groupBy": [{"value": "DATA_CENTRE", "mapping": "location"}], "filters": []})
       // }).then((res)=>{
       //  console.log('......res.....', res);
       // });

      $scope.selectedFilter = {
        classification: 'STAFF',
        groupBy: ['Location'],
        filters: [{field: "labour_id", value: "*"}],
        countType: "countSum",
        buttonActivated: 'People'
      };

      var countType = "countSum"; //init

      /*************** Events ***********************/

       
       const onOutputChange = (event) => {
          // console.log("dim change", data, $scope.currentSnapshot);
          $scope.output = settingsService.getPrimaryOutput();
          if (!$scope.output) {
              $scope.currentSnapshot = null;
              return ;
          };
          $scope.currentSnapshot = {dimensionSnapshotUuid: $scope.output.instanceId};

          if (!$scope.costQuery) {
            drawComponents();
          }
        updateComponents();
      };

      events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
      $scope.$on('$destroy', () => {
          events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
        });

      /*************** Watchers ***********************/

      /*************** Scope functions ***********************/
      $scope.changeFilterToSet = function(who) {
        console.log(who);
      }

      $scope.changeFilterTo = function(groupBy) {
        switch (groupBy) {
          case 'People':
            $scope.selectedFilter = {
              classification: 'STAFF',
              groupBy: ['Location'],
              filters: [{field: "labour_id", value: "*"}],
              countType: "countSum",
              buttonActivated: 'People'
            };
            break;
          case 'DataCentre':
            $scope.selectedFilter = {
              classification: 'DATA_CENTRE',
              groupBy: ['DataCentreLocation'],
              filters: [
                {
                  field: 'costPotType',
                  value: 'data centre'
                },
                {
                  field: "DataCentreId",
                  value: "*"
                }],
              countType: "count",
              buttonActivated: 'DataCentre'
            };
            break;
          default:
            $scope.selectedFilter = {
              classification: 'SERVER',
              groupBy: ['DataCentreLocation'],
              filters: [
                {
                  field: 'costPotType',
                  value: 'servers'
                },
                {
                  field: "ServerId",
                  value: "*"
                }],
              countType: "count",
              buttonActivated: 'Server'
            };
            break;
        }

        drawComponents();
      };

      /*************** Functions ***********************/

      function drawComponents() {
        $scope.output = settingsService.getPrimaryOutput();
          if (!$scope.output) {
            $scope.currentSnapshot = null;
            return ;
        };
        $scope.currentSnapshot = {dimensionSnapshotUuid: $scope.output.instanceId};

        $scope.costQuery = costQueryParameter.createNew(
            $scope.selectedFilter.classification, $scope.selectedFilter.groupBy,
            $scope.selectedFilter.filters, 'units');

        $scope.mapComponent = {
          id: 0,
          width: 12,
          zoomable: true,
          valueField: "Count",
          type: "map",
          name: "Metrics Map",
          subtitle: "Selected attributes are displayed on the world may, to show geographical location of resources.",
          countType: $scope.selectedFilter.countType,
          query: $scope.costQuery,
          selectableGroupBys: [
            {
              disable: true,
              value: 'Location',
              display: 'people'
            },
            {
              disable: true,
              value: 'DataCentreLocation',
              display: 'Data Centre'
            },
            {
              disable: true,
              value: 'DataCentreLocation',
              display: 'Server'
            }],
        };

        $scope.queryTree = costQueryParameter.createNew(
            $scope.selectedFilter.classification, $scope.selectedFilter.groupBy,
            $scope.selectedFilter.filters);

        // console.log('--------$scope.queryTree------', angular.copy($scope.queryTree));

        $scope.treeComponent = {
          id: 1,
          width: 12,
          zoomable: true,
          dashboardSource: $scope.queryTree.groupBy,
          valueField: "Sum",
          type: "tree",
          baseType: "tree",
          name: "Metrics Tree",
          subtitle: "Partition table displaying the cost base in proportion to each location.",
          query: $scope.queryTree,
          selectableGroupBys: [
            {
              disable: true,
              value: 'Location',
              display: 'people'
            },
            {
              disable: true,
              value: 'DataCentreLocation',
              display: 'Data Centre'
            },
            {
              disable: true,
              value: 'DataCentreLocation',
              display: 'Server'
            }],
          colors: ['#fd8a5e', '#72abd6', '#ffb17b', '#ffdfbf', '#5dca90'],
        };

        $scope.headlineInfo = {
          classification: "GENERAL_LEDGER",
          dimension: $scope.currentSnapshot
        };

        updateComponents();
      }

      function updateComponents() {
        $scope.output = settingsService.getPrimaryOutput();
          if (!$scope.output) {
            $scope.currentSnapshot = null;
            return ;
        };
        $scope.currentSnapshot = {dimensionSnapshotUuid: $scope.output.instanceId};
        
        ReportService.updateComponent($scope.mapComponent, $scope.costQuery,
            $scope.selectedFilter.classification, undefined,
            $scope.currentSnapshot);
        ReportService.updateComponent($scope.treeComponent, $scope.queryTree,
            $scope.selectedFilter.classification, undefined,
            $scope.currentSnapshot);

        getNumberElements();
      }

      function getNumberElements() {

        $scope.numberElements = 0;
        ReportService.getCosts($scope.costQuery).then(function(data) {
          var plainData = data.plain();
          var count = 0;

          console.log($scope.mapComponent.countType);
          console.log(plainData);

          for (var x in plainData) {
            switch ($scope.mapComponent.countType) {
              case "countSum":
                for (var y in plainData[x]) {
                  count += plainData[x][$scope.costQuery.target][$scope.costQuery.accessor];
                }
                break;
              case "count":
                for (var y in plainData[x]) {
                  count += 1;
                }
                break;
              default:
                count += plainData[x][$scope.costQuery.target][$scope.costQuery.accessor];
                break;
            }
          }
          $scope.numberElements = count;

          $scope.numberElements = d3.format(".0f")($scope.numberElements);
        })
      }

      drawComponents(countType);
    }
    ]);
