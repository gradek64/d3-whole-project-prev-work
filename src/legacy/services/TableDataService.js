/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('TableDataService', ['ChartDataFormat', function(ChartDataFormat) {
  /**
   * Create data for table view
   * @param plainData       API data response (sanitised by .plain())
   * @param accessor        Value accessor (sum/count/ave/min/max)
   * @param isNull          Return null or level above if not specified
   * @param isBubble        Bubble chart data accessor is InitialCost/RenewalCost/RenewalDate, not amount
   * @returns {Array}       Data array
   */
  function processTableData(plainData, amntAccessor, accessor, isNull, isBubble, showUnits, isCostFlow, createNewTreeObject)
  {
    var amountAccessor = (isBubble) ? "InitialCost" : amntAccessor || "amount";
    var valAccessor = accessor || "sum";
    var flatData = [];

    for(var a in plainData)
    {
      var level1 = plainData[a];

      if(level1[amountAccessor] && !isCostFlow)
      {
        var b = (isNull) ? null : a;
        var d = level1[amountAccessor];
        var val = ChartDataFormat.format(d[valAccessor]);

        var obj = createNewTreeObject(a, b, b, val, d["count"]);

        if(isBubble) {
          obj = addBubbleData(obj, level1);
        }

        flatData.push(obj);
      }
      else {
        for(var b in level1)
        {
          var level2 = level1[b];

          if(level2[amountAccessor])
          {
            var c = (isNull) ? null : b;
            var d = level2[amountAccessor];
            var e = (showUnits && level2.Units) ? level2.Units.avg : level2['count'];
            var val = ChartDataFormat.format(d[valAccessor]);

            var obj2 = createNewTreeObject(a,b,c,val, e);

            if(isBubble) {
              obj = addBubbleData(obj2, level2);
            }

            flatData.push(obj2);
          }
          else {
            for(var c in level2)
            {
              if(level2[c][amountAccessor]) {
                var d = level2[c][amountAccessor];
                var e = (showUnits && level2[c].Units) ? level2[c].Units.avg : level2[c]['count'];
                var val = ChartDataFormat.format(d[valAccessor]);

                var obj3 = createNewTreeObject(a,b,c,val, e);

                if (isBubble) {
                  obj = addBubbleData(obj3, level2[c]);
                }

                flatData.push(obj3);
              }
            }
          }
        }
      }
    }

    return flatData;
  }

  //WARN: very rough. Only works for the exact scenario we have for bubble right now.
  function addBubbleData(obj, level)
  {
    obj.renewal = level["RenewalCost"]["sum"];
    obj.level3 = obj.level1;
    obj.level1 = level["RenewalDate"]["avg"];

    return obj;
  }

  function processFlatTableData(plainData, flatData) {
    var dataKeys = Object.keys(plainData);

    var processedData = {};

    for(var i = 0; i < dataKeys.length; i++) {
      var costPot = flatData.costPots.filter(function(d){ return d.id == dataKeys[i]; }); //need type coersion

      var parentCostPot = null;
      var parentParentCostPot = null;

      var originalData = plainData[dataKeys[i]];

      if(costPot && costPot.length > 0) {
        if(costPot[0].parentId) {
          parentCostPot = flatData.costPots.filter(function(d){ return d.id == costPot[0].parentId; });

          if(parentCostPot[0].parentId) {
            parentParentCostPot = flatData.costPots.filter(function(d){ return d.id == parentCostPot[0].parentId; });
          }
        }

        var newData = {
          metrics: {
            amount: originalData.amount
          },
          uniqueValues: {}
        };

        for(var j = 0; j < flatData.headers.length; j++) {
          newData.uniqueValues[flatData.headers[j]] = [ costPot[0][flatData.headers[j]] || "TEST" ];
        }

        if(parentParentCostPot) {
          processedData[parentParentCostPot[0].name][parentCostPot.name][costPot[0].name] = newData;
        }
        else if(parentCostPot) {
          processedData[parentParentCostPot[0].name][parentCostPot[0].name][costPot[0].name] = newData;
        }
        else {
          processedData[costPot[0].name] = newData;
        }
      }
    }
    return processedData;
  }

  function formatNestedData(plainData, comp) {
    var concatString = (comp.type === "bar" || comp.type === "donut" || comp.type === "pie"); // Hacky

    var outputArr = [];

    for(var x in plainData) {
      var level1 = x;
      if(plainData[x].children) {
        for(var y in plainData[x].children) {
          var level2 = y;

          if(plainData[x].children[y].children) {
            for (var z in plainData[x].children[y].children) {
              var level3 = z;

              var stats = plainData[x].children[y].children[z].stats;
              var sum = (stats) ? stats.sum : 0;

              addNestedValue(outputArr, level1, level2, level3, sum, concatString);
            }
          }
          else {
            var stats = plainData[x].children[y].stats;
            var sum = (stats) ? stats.sum : 0;

            addNestedValue(outputArr, level1, level2, null, sum, concatString);
          }
        }
      }
      else {
        var stats = plainData[x].stats;
        var sum = (stats) ? stats.sum : 0;

        addNestedValue(outputArr, level1, null, null, sum, concatString);
      }
    }

    return outputArr;
  }

  function addNestedValue(outputArr, level1, level2, level3, amount, concatString) {
    if(concatString && amount) {
      var key = level1;

      if(level2) {
        key += " / " + level2;
      }
      if(level3) {
        key += " / " + level3;
      }

      outputArr.push({
        key: key,
        value: amount
      })
    }
    else {
      outputArr.push({
        level1: level1,
        level2: level2,
        level3: level3,
        total: amount || 0
      });
    }
  }

  function processNestedData(plainData, comp) {
    var data = formatNestedData(plainData, comp);

    var rootData = d3.nest()
    .key(function(d) { return d.level1; })
    .key(function(d) { return d.level2; })
    .key(function(d) { return d.level3; })
    .entries(data);

    var root = d3.hierarchy({values: rootData }, function(d) { return d.values; })
    .sum(function(d) { return d.total; })
    .sort(function(a, b) { return b.total - a.total; });

    return { data: root, tableData: data };
  }

  return {
    processTable: processTableData,
    processFlat: processFlatTableData,
    processNested: processNestedData
  }
}]);
