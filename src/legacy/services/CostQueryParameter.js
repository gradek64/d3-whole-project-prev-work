'use strict';

/**
 * Created by enrique on 24/11/2016.
 */

/* eslint-disable */
/* prettier-ignore */

/**
 * @param classification Type of Cost pot e.g. INFRASTRUCTURE, STAFF....
 * @param target I think we only support 'Units' and 'amount' for now
 * @param action whether we want the 'sum' or the 'stats'
 * @param filters Array with zero or more filters
 */
angular.module('app')
.factory('CostQueryParameter', [function () {

  function isObject(value) {
    const type = typeof value
    return value != null && (type == 'object' || type == 'function')
  }

  function isEmpty(value) {
    if (value == null || value == undefined) {
      return true
    }
    if(Array.isArray(value) || typeof value == 'string' || typeof value.splice == 'function') {
      return !value.length
    }

    if (isObject(value)) {
      return !Object.keys(value).length
    }
    for (const key in value) {
      if (hasOwnProperty.call(value, key)) {
        return false
      }
    }
    return true
  }

  var generalLedgerGroupBy = [
    {display: "Source_Legal_Entity", value: "SourceLegalEntity"},
    {display: "Cost Centre", value: "CostCentre"},
    {display: "Nominal", value: "NominalDescription", disabled: true},
   // {display: "Nominal Code", value: "NominalId", disabled: true},
    {display: "Cost Pool", value: "CostPoolMapping"}
  ];

  var contractsGroupBy = angular.copy(generalLedgerGroupBy);
  contractsGroupBy.push({display: "Vendor", value: "Vendor"});

  var labourGroupBy = angular.copy(generalLedgerGroupBy);
  labourGroupBy.push({display: "Role", value: "Role"},{display: "Vendor", value: "Vendor"});


  /*levels in new API*/

  /*
      GENERAL_LEDGER = Source 
      Labour,Contract, Other = Entitment;
      DATA_CENTRE = Infrastructure 1;
      IT resouce Stack = Functional;
      Delivery Service is gone;
      Storage = Storage;
      Server 
      IT services = service;

      ORGANISATION_CAPABILITIES = Target;
  
  */

  var classificationEnum = Object.freeze({
    "GENERAL_LEDGER": {
      name: "GENERAL_LEDGER",
      display: "Source", value: "GENERAL_LEDGER", level: 1,
      groupBy: generalLedgerGroupBy
    },

    /*"STAFF": {
      name: "STAFF",
      display: "Labour", value: "STAFF", level: 2,
      groupBy: labourGroupBy,
      masterFilter: "labour_id"
    },

    "NON_STAFF": {
      name: "NON_STAFF",
      display: "Contracts", value: "NON_STAFF", level: 2,
      groupBy: contractsGroupBy,
      masterFilter: "contracts_id"
    },

    "OTHER": {
      name: "OTHER",
      display: "Other", value: "OTHER", level: 2,
      groupBy: generalLedgerGroupBy,
      masterFilter: "other_id"
    },*/
    
    "STAFF": {
      name: "STAFF",
      display: "Entitlement", value: "STAFF", level: 2,
      groupBy: labourGroupBy,
      masterFilter: "labour_id"
    },

    "RESOURCE": {
      name: "RESOURCE",
      //ITRS Functional is takken from Entitlement so level 2
      display: "Functional", value: "RESOURCE", level: 2,
      groupBy: [{display: "ITFBLevel1", value: "itrs"},
        {display: "ITFBLevel2", value: "subItrs"},
        {display: "ITFBLevel3", value: "subSubItrs"}]
    },

   /* "INFRASTRUCTURE": {
      name: "INFRASTRUCTURE",
      value: "INFRASTRUCTURE",
      level: 4,
      groupBy: []
    },*/

    "DATA_CENTRE": {
      name: "DATA_CENTRE",
      display: "Infrastructure 1", value: "INFRASTRUCTURE", level: 3,
      groupBy: [{display: "Data Centre", value: "DataCentreLocation"}],
      /*groupBy: [{display: "Legal Entity", value: "SourceLegalEntity"},
        {display: "Cost Centre", value: "CostCentre"},
        {display: "Data Centre Id", value: "DataCentreId", disabled: true},
        {display: "Data Centre Location", value: "DataCentreLocation"}],*/
      masterFilter: "data_centre_id"
    },

    "STORAGE": {
      name: "STORAGE",
      display: "Infrastructure 2", value: "INFRASTRUCTURE", level: 4,
      groupBy: [
        {display: "Network", value: "network"},
        {display: "Physical Server", value: "physical_server"},
        {display: "Storage", value: "StorageId"}],
      /*groupBy: [{display: "Legal Entity", value: "SourceLegalEntity"},
        {display: "Cost Centre", value: "CostCentre"},
        {display: "Storage Id", value: "StorageId", disabled: true}],*/
      masterFilter: "storage_id"
    },
    // no Delivery services
    /*"DELIVERY_SERVICES": {
      name: "DELIVERY_SERVICES",
      display: "Delivery Services", value: "INFRASTRUCTURE", level: 4,
      groupBy: generalLedgerGroupBy,
      groupBy: [{display: "Legal Entity", value: "SourceLegalEntity"},
        {display: "Service Name", value: "ServiceName"},
        {display: "Delivery Service Id", value: "Id", disabled: true}],
      masterFilter: "delivery_platform_id"
    },*/
    "SERVER": {
      name: "SERVER",
      display: "Infrastructure 3", value: "INFRASTRUCTURE", level: 5,
      groupBy: [
        {display: "GENERIC", value: "generic"},
        {display: "VIRTUAL_SERVER", value: "virtual_server",}]
      /*groupBy: [{display: "Legal Entity", value: "SourceLegalEntity", },
        {display: "Cost Centre", value: "CostCentre"},
        {display: "Server Id", value: "ServerId", disabled: true}],*/,
      masterFilter: "storage_id"
    },

    "ITS": {
      name: "ITS",
      display: "Services", value: "ITS", level: 6,
      groupBy: [{display: "SERVICE_TYPE", value: "ServiceType"},
        {display: "SERVICE_GROUP", value: "ServiceGroup"},
        {display: "SERVICE", value: "ServiceName"}]
    },
    "ORGANISATION_CAPABILITIES": {
      name: "ORGANISATION_CAPABILITIES",
      display: "TARGET", value: "ITS", level: 7,
      target: "distributedCosts.amount",
      groupBy: [{display: "Target Legal Entity", value: "TargetLegalEntity"},
        {display: "Target Cost Centre", value: "TargetCostCentre"}]
    }
  });

  var getCurrentUUID = function () {
    // /processor/dimensions returns dimensionSnapshotId;
    // /wrangler/dimensions returns dimensionSnapshotUuid
    return null;
    // return (localStorageService.get('dimensionSnapshot')) ? localStorageService.get('dimensionSnapshot').dimensionSnapshotUuid : null;
  };

  var orgCapFix = function (costQueryParameter) {
    var groupBy = [];
    var nestedGroupBy = [];

    if(costQueryParameter.groupBy !== null) {
      // split old queries (failsafe)
      if (costQueryParameter.groupBy.indexOf(",") > -1) {
        costQueryParameter.groupBy = costQueryParameter.groupBy.split(",");
      }

      // split org cap groupbys into nested group by
      for (var i = 0; i < costQueryParameter.groupBy.length; i++) {
        if (costQueryParameter.groupBy[i] === 'TargetLegalEntity') {
          nestedGroupBy.push('distributedCosts.targetLegalEntity');
        }
        else if (costQueryParameter.groupBy[i] === 'TargetCostCentre') {
          nestedGroupBy.push('distributedCosts.targetCostCentre');
        }
        else {
          groupBy.push(costQueryParameter.groupBy[i]);
        }
      }
    }
    else {
      console.log("Warning: Query group by is null");
      return false;
    }

    // reassign
    costQueryParameter.groupBy = groupBy;
    costQueryParameter.nestedGroupBy = nestedGroupBy;

    var nestedFilters = isEmpty(costQueryParameter.nestedFilters) ? [] : costQueryParameter.nestedFilters;
    var filters = [];

    if (costQueryParameter.filters && costQueryParameter.filters.length > 0) {
      for (var i = 0; i < costQueryParameter.filters.length; i++) {
        // split old queries
        if (costQueryParameter.filters[i].indexOf && costQueryParameter.filters[i].indexOf(",") > -1) {
          costQueryParameter.filters[i] = costQueryParameter.filters[i].split(",");
          costQueryParameter.filters[i] = {
            field: costQueryParameter.filters[i][0],
            value: costQueryParameter.filters[i].slice(1)
          };
        }

        if (costQueryParameter.filters[i].field === "TargetLegalEntity") {
          costQueryParameter.filters[i].field = "distributedCosts.targetLegalEntity";
          nestedFilters.push(costQueryParameter.filters[i]);
        }
        else if (costQueryParameter.filters[i].field === "TargetCostCentre") {
          costQueryParameter.filters[i].field = "distributedCosts.targetCostCentre";
          nestedFilters.push(costQueryParameter.filters[i]);
        }
        else {
          filters.push(costQueryParameter.filters[i]);
        }
      }
    }

    // reassign
    costQueryParameter.filters = filters;
    costQueryParameter.nestedFilters = nestedFilters;
  };

  function CostQueryParameter(classification, groupBy, filters, type, date, interval, uuid) {
    var obj = {
      dimensionSnapshotUuid: uuid || getCurrentUUID(),
      classification: classificationEnum[classification],
      // target: classificationEnum[classification].target || "amount",
      target: "amount",
      action: 'stats',
      accessor: 'sum',
      groupBy: groupBy,
      filters: filters || [],
      type: type,
      nested: (classification === 'ORGANISATION_CAPABILITIES'),
      date: date,
      interval: interval,
      total: (type === 'total')
    };

    if (type === 'units') {
      obj.target = 'Units';
      obj.accessor = 'avg';
    }

    return obj;
  }

  return {
    createNew: function(classification, groupBy, filters, type, date, interval, uuid) {
      if(classificationEnum[classification] === undefined) {
        throw "Error: Invalid Classification (" + classification + ")";
      }
      else {
        var obj = new CostQueryParameter(classification, groupBy, filters, type, date, interval, uuid);

        // if(obj.dimensionSnapshotUuid === null) {
        //   throw "Error: Invalid/Missing Snapshot UUID";
        // } else {
        //   return obj;
        // }
        return obj;

      }
    },
    createWithUuid: function(uuid, classification, groupBy, filters, type) {
      if(classificationEnum[classification] === undefined) {
        throw "Error: Invalid Classification";
      }
      else {
        var obj = CostQueryParameter(classification, groupBy, filters, type, null, null, uuid);

        if (classification === 'ORGANISATION_CAPABILITIES') {
          orgCapFix(obj);
        }

        if(obj.dimensionSnapshotUuid === null) {
          throw "Error: Invalid/Missing Snapshot UUID";
        } else {
          return obj;
        }

      }
    },
    update: function(obj) {
      if (obj && obj.classification.name === 'ORGANISATION_CAPABILITIES') {
        orgCapFix(obj);
      }
      return obj;
    },
    classifications: classificationEnum
  };
}]);
