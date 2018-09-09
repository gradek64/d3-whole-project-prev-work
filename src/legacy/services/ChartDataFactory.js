/**
 * Created by joshrayman on 21/10/2016.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').factory('ChartDataFactory', [
    'ForceDataService',
  'OtherDataService',
  'SankeyDataService',
  'TableDataService',
  'TreeDataService',
  'ChartDataFormat',
  function (
      ForceDataService,
      OtherDataService,
      SankeyDataService,
      TableDataService,
      TreeDataService,
      ChartDataFormat) {
    var formatNumber = function(d){ return ChartDataFormat.format(d); };

    function addValue(obj, value, valueField) {
      obj[valueField] = formatNumber(value);
      obj.isNegative = false;

      return obj;
    }

    function createNewObject(source, target, value, slevel, parent)
    {
      var obj = {
        parent: (parent) ? parent : null,
        source: source,
        target: target,
        slevel: slevel,
        tlevel: slevel + 1
      };

      return addValue(obj, value, "value");
    }

    function createNewTreeObject(a, b, c, d, e)
    {
      var obj = {
        level1: a,
        level2: b,
        level3: c,
        units: e
      };

      return addValue(obj, d, "total");
    }

    function processLevel(outputArr, level, source, tier, accessor, type, i, parent) {
      var amountAccessor = "distributedCosts.amount";
      var valueAccessor = accessor;

      // // track level
      if (type === "force" || type === "sankey") {
        i = i + 1;
      }
      // else {
      //   i = 0;
      // }

      for (var z in level) {
        if (z === accessor) {   //catch
          continue;
        }

        //is in array
        if (level.hasOwnProperty(z)) {
          var src = source,
              trgt = tier + " / " + z;

          if(type === "force") {
            src = tier;
            trgt = z;
          }

          if(type === "sankey") {
            src = i + " / " + source;
            trgt = (i + 1) + " / " + z;
          }

          //if has cost info
          if (level[z][amountAccessor] === undefined) {
            //parent is used for coloring consistently
            //recursively go down to the next level
            processLevel(outputArr, level[z], source, z, accessor, type, i  + 1, parent);

            if (level[z][amountAccessor]) {
              var val = level[z][amountAccessor][valueAccessor];
              outputArr.push(createNewObject(src, trgt, val, i, parent));

              if (type === "chord") {
                outputArr.push(createNewObject(trgt, src, val / 2, i, parent));
              }
            }
          }
          else {
            //lowest leaf (no children)
            if (level[z][amountAccessor]) {
              var val = level[z][amountAccessor][valueAccessor];

              outputArr.push(createNewObject(src, trgt, val, i, parent));

              //TODO: unsure if this is right - need to see it with real data.
              if (type === "chord") {
                outputArr.push(createNewObject(trgt, src, val / 2, i, parent));
              }
            }
          }
        }
      }
    }

    function processNested(plainData, comp) {
      return TableDataService.processNested(plainData, comp, addValue, formatNumber);
    }

    function processData(d)
    {
      // var processDataObj = {
      //   plainData: plainData,
      //   type: comp.type,
      //   accessor: accessor,
      //   interval: interval,
      //   showUnits: comp.showUnits,
      //   target: costQueryParameter.target,
      //   isOrdinal: (comp.axisInfo && comp.axisInfo.xType === 'ordinal')
      //   // isCostFlow: false,
      //   // flatData: comp.flatData,
      //   //
      // };

      var data, tableData,
          isNull = true;

      //ForceDataService, OtherDataService, SankeyDataService, TableDataService, TreeDataService

      if(d.flatData) {
        tableData = TableDataService.processFlat(d.plainData, d.flatData);
      }
      else if(d.type !== "heatMapBar")
      {
        tableData = TableDataService.processTable(d.plainData, d.target, d.accessor, isNull, (d.type === "bubble"), d.showUnits, d.isCostFlow, createNewTreeObject);
      }

      switch(d.type) {
        case 'tree':
          data = TreeDataService.process(d.plainData, d.target, d.accessor, !isNull, addValue);
          break;
        case 'sankey':
          data = SankeyDataService.process(d.plainData, d.target, d.accessor, createNewObject, addValue);
          break;
        case 'chord':
          data = OtherDataService.processChord(d.plainData, d.target, d.accessor, processLevel, addValue);
          break;
        case 'force':
          data = ForceDataService.process(d.plainData, d.target, d.accessor);
          break;
        case 'heatMapBar':
          console.warn("Code needs updating");
          data = OtherDataService.processHeatmap(d.plainData, d.interval);
          tableData = []; //TableDataService.processHeatmapTable(plainData, accessor, true);
          break;
        case 'sunburst':
        case 'partition':
        case 'table':
          data = TreeDataService.process(d.plainData, d.target, d.accessor, isNull, addValue, formatNumber);
          break;
        case 'pie':
        case 'donut':
          data = OtherDataService.processSimple(d.plainData, d.target, d.accessor, !d.isOrdinal, true, addValue);
          break;
        case 'line':
        case 'bar':
        case 'percentage':
        case 'area':
          data = OtherDataService.processSimple(d.plainData, d.target, d.accessor, !d.isOrdinal, false, addValue);
          break;
        case 'bubble':
          console.warn("Code needs updating");
          data = OtherDataService.processBubble(d.plainData, d.target, d.accessor);
          break;
        default:
          data = d.plainData;
          break;
      }

      if(Array.isArray(data)) {
        // filter out zero fields
        data = data.filter(function(d){ return (d.total && d.total !== 0) || (d.value && d.value !== 0); });
        tableData = tableData.filter(function(d){ return (d.total && d.total !== 0) || (d.value && d.value !== 0); });
      }

      return {data: data, tableData: tableData};
    }

    function processTable(plainData, target, accessor) {
      if(!target) {
        target = "amount";
      }
      if(!accessor) {
        accessor = "sum";
      }

      return TableDataService.processTable(plainData, target, accessor, true, false, false, false, createNewTreeObject);
    }

    function formatData(plainData, costQueryParameter) {
      return TableDataService.processTable(plainData, costQueryParameter.target, costQueryParameter.accessor, true, false, false, false, createNewTreeObject);
    }

    function transformToTable(data, accessor) {
      return Object.keys(data).map(function(key){
        return {
          name: key,
          value: data[key][accessor.value]['sum']
        };
      });
    }

    function flattenByFirstKey(object, definition, level) {

      var firstKey;
      for (firstKey in object) {
        if (object.hasOwnProperty(firstKey)) {
          break;
        }
      }

      // exit from recursion (it is a bit dangerous :) the definition must match the depth of the object
      // also sum is hardcoded (it is ok if the data from the server is consistent)
      if (definition.length === level) {
        return {'value': object[firstKey]['sum']};
      }

      var o = {}; o[definition[level]] = firstKey; // ES5 shit ( should be {[definition[level]]: firstKey} )
      return Object.assign(o, flattenByFirstKey(object[firstKey], definition, level + 1));
    }

    // function flatten(data, definition) {
    //   return Object.keys(data).map(function (key) {
    //     var o = {}; o[key] = data[key]; // ES5 shit ( should be {[key]: data[key]} )
    //     return flattenByFirstKey(o, definition, 0);
    //   });
    // }

    function flatten(data, definition) {
      return flattenObj(data, definition);
    }

    function flattenObj(obj, definition, keys) {
      if(keys === undefined) {
        keys = [];
      }
      return Object.keys(obj).reduce(function(acc, key) {
        if (definition.length === keys.length) {
          // acc.push({[keys.concat(key).join('.')]: obj[key]['sum']});
          // return acc;
          var o = {};
          definition.forEach(function(e, i) {
            o[e] = keys[i];
          });
          o.value = obj[key]['sum'];
          acc.push(o);
          return acc;
        }

        return acc.concat(flattenObj(obj[key], definition, keys.concat(key)));
      }, []);
    }

    return {
      formatData: formatData,
      processData: processData,
      processNested: processNested,
      processTable: processTable,
      transformToTable: transformToTable,
      flatten: flatten,
      flattenObj: flattenObj,

      //possible remove using build step in the future:
      //https://philipwalton.com/articles/how-to-unit-test-private-functions-in-javascript/
      _processLevel: processLevel
    };

  }]);
