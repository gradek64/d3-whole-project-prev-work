/**
 * Created by joshrayman on 03/11/2016.
 */

'use strict';

/* eslint-disable */
/* prettier-ignore */
angular
  .module('pages.inter-company-charges', [
    'ngRoute',
    'utils.events',
    'utils.constants',
  ])
  .config([
    '$routeProvider',
    'CONSTANTS.USER_ROLES',
    function($routeProvider, USER_ROLES) {
      $routeProvider.when('/inter-company-charges', {
        templateUrl: 'legacy/pages/inter-company-charges/inter-company-charges.html',
        controller: 'interCompanyChargesCtrl',
        data: {
          authorisedRoles: [USER_ROLES.ALL],
        },
        name: 'inter-company-charges',
      });
    },
  ])
  .controller('interCompanyChargesCtrl', [
    'events',
    '$scope',
    '$route',
    'CostQueryParameter',
    'ReportService',
    'ReportListService',
    'settingsService',
    'CONSTANTS.EVENTS',
    '$timeout',
    function(
      events,
      $scope,
      $route,
      CostQueryParameter,
      ReportService,
      ReportListService,
      settingsService,
      EVENTS,
      $timeout
    ) {

      var glQuery;

      /*************** Init variables ***********************/
      $scope.topNav = ReportListService.getList("costAnalytics");

      //duplicated from RightSideBarCtrl.js - ideally this would be initialised once.
      $scope.settings = {
        hideLabels : false,
        legalEntityCode: true,
        costCentreCode: true,
        nominalCode: true
      };

      // $scope.currentSnapshot = ReportService.getCurrentDimensionSnapshot();

      $scope.source = ($scope.settings.legalEntityCode) ? "SourceLegalEntity" : "SourceLegalEntityDescription";
      $scope.target = ($scope.settings.legalEntityCode) ? "TargetLegalEntity" : "TargetLegalEntityDescription";


      /*************** Events ***********************/

      const onOutputChange = (event, data) => {
        $scope.ready = false;
        $timeout(() => {
          render();
        }, 10)
      };

      events.on(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
      $scope.$on('$destroy', () => {
        events.off(EVENTS.PRIMARY_OUTPUT_CHANGED, onOutputChange);
      });      

      $scope.$on('settingChanged', function(event, data){
        // console.log("settingChanged", $scope.settings.legalEntityCode, data.legalEntityCode);

        var renderAgain = false;

        if($scope.settings.legalEntityCode !== data.legalEntityCode) {
          renderAgain = true;
          $scope.settings.legalEntityCode = data.legalEntityCode;
        }

        $scope.source = ($scope.settings.legalEntityCode) ? "SourceLegalEntity" : "SourceLegalEntityDescription";
        $scope.target = ($scope.settings.legalEntityCode) ? "TargetLegalEntity" : "TargetLegalEntityDescription";

        $scope.costQuery.groupBy = [$scope.source, $scope.target];

        // console.log("settingChanged", $scope.costQuery);

        //TODO show loading

        if(renderAgain && $scope.costQuery && glQuery) {
          ReportService.updateComponent($scope.component, $scope.costQuery);
        }
      });

      //TODO listen on load complete.

      /*************** Watchers ***********************/

      /*************** Scope functions ***********************/

      /*************** Functions ***********************/

      function render() {
        
        $scope.output = settingsService.getPrimaryOutput();
        if (!$scope.output) {
          $scope.currentSnapshot = null;
          return ;
        };
        $scope.currentSnapshot = $scope.output.instanceId;
        //query for total from general leger
        glQuery = CostQueryParameter.createNew('GENERAL_LEDGER', null, [], 'total', undefined, undefined, $scope.currentSnapshot);
        //query for ITS source to target costs
        $scope.costQuery = CostQueryParameter.createNew("ORGANISATION_CAPABILITIES", [$scope.source, $scope.target], [], 'total', undefined, undefined, $scope.currentSnapshot);

        // $scope.costQuery = CostQueryParameter.createNew("ORGANISATION_CAPABILITIES", ["A"], []);

          drawComponents();
          calculateGl();
      }

      function drawComponents() {
        // console.log($scope.costQuery);
        $scope.component = {
          id: 0,
          width: 12,
          zoomable: false,
          type: "chord",
          name: "Inter-Company Charges",
          height: "full",
          tableEnabled: true,
          query: $scope.costQuery
        };

        ReportService.updateComponent($scope.component, $scope.costQuery).then(() => {

          // console.log('----------------- component updated');
          $timeout(() => {
            $scope.$apply();
            // console.log('----------------- scope applied');

            $scope.ready = true;

          }, 10);
        })


      }

      function calculateGl() {
        glQuery.getTotal = true;

        glQuery.classification.level = 7;

        ReportService.getCosts(glQuery).then(function (stats) {
          glQuery.getTotal = false;
          $scope.amount = "£" + d3.format(",.2f")(stats.data.amount.sum);
        });
      }

      $timeout(() => {
        render();
      }, 10)
    },
  ]);
