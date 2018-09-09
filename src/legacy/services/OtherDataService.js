
/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('OtherDataService', function() {

  function processChordData(plainData, target, accessor, processLevel, addValue)
  {
    var outputArr = [];

    var rows = plainData;
    var amountAccessor = target;
    var valueAccessor = accessor;

    for(var x in rows)
    {
      var source = x;
      var level = rows[x];

      for(var y in level)
      {
        if(level[y][amountAccessor] === null)
        {
          processLevel(outputArr, level[y], source, y, accessor);
        }
        else {
          var obj1 = {
            source: x,
            target: y
          };

          var obj2 = {
            source: y,
            target: x
          };

          if(level[y][amountAccessor]) {
            var value = level[y][amountAccessor][valueAccessor];
            outputArr.push(addValue(obj1, value, "value"));
            outputArr.push(addValue(obj2, value, "value"));
          }
        }
      }
    }

    return outputArr;
  }

  var transformDate = function(date) {

    var currentDate = new Date();
    var newDate = new Date(date);
    var timeDiff = Math.abs(currentDate.getTime() - newDate.getTime());

    return Math.floor(timeDiff / (1000 * 3600 * 24 * 365)); //Convert to years

  };

  //TODO: Note - not updated to negative numbers
  var processHeatmapData = function (plainData, dateType) {
    function sortNumber(a, b) {
      return a - b;
    }

    var departments = [];
    var allDates = [];

    var yearsData = {};

    for (var department in plainData) {
      if (!plainData.hasOwnProperty(department)) continue;
      departments.push(department);
      yearsData[department] = {};
      yearsData[department][dateType] = {};

      var departmentData = plainData[department][dateType];
      for (var interval in departmentData) {
        if (!departmentData.hasOwnProperty(interval)) continue;

        var value = departmentData[interval];
        var yearsOfExperience = transformDate(interval);
        yearsData[department][dateType][yearsOfExperience] = value;

        allDates.push(transformDate(interval));
      }
    }

    allDates.sort(sortNumber);
    departments.sort();

    var outputData = [];

    for (var i = 0; i < departments.length; i++) {
      var heatMapRow = {name: departments[i], values: []};
      for (var j = 0; j < allDates.length; j++) {
        if (j === allDates.length - 1) {
          heatMapRow['values'].push({
            range: [allDates[j], allDates[j]],
            value: yearsData[departments[i]][dateType][allDates[j]] || 0
          })
        } else {
          heatMapRow['values'].push({
            range: [allDates[j], allDates[j + 1]],
            value: yearsData[departments[i]][dateType][allDates[j]] || 0
          })
        }
      }
      outputData.push(heatMapRow);
    }

    return outputData;
  };


//TODO: Note - not updated to negative numbers
  function processBubbleData(data, target, accessor) {
    function processData(plainData, target, accessor) {
      var valAccessor = accessor;
      var flatData = {};

      for (var a in plainData) {
        var level1 = plainData[a];
        var row = {};
        for (var b in level1) {
          var level2 = level1[b];
          var cell = {};

          for (var c in level2) {
            if (c === 'RenewalDate') {
              cell[c] = formatNumber(level2[c]["avg"]);
            }
            else {
              cell[c] = formatNumber(level2[c][valAccessor])
            }
          }
          row[b] = cell;
        }
        flatData[a] = row;
      }
      return flatData;
    }

    var data = processData(data, target, accessor);

    var processedData = [];

    var target1 = "RenewalDate";   //x = date
    var target2 = "InitialCost";   //y = initial cost?
    var target3 = "RenewalCost";   //z (r) = renewal cost

    for (var x in data) {
      var type = x;

      for (var y in data[x]) {
        var key = y;

        processedData.push({
          key: key,
          val1: new Date(data[x][y][target1]),
          val2: data[x][y][target2],
          val3: data[x][y][target3],
          type: type
        });
      }
    }

    return processedData;
  }

  function processSimpleData(data, target, accessor, isDate, getPerc, addValue)
  {
    var flatData = [];
    var amountAccessor = target || "amount";
    var valueAccessor = accessor || "sum";

    for(var x in data)
    {
      if(x === amountAccessor)
        continue;

      if (data.hasOwnProperty(x) && data[x][amountAccessor]) {
        var value = data[x][amountAccessor][valueAccessor];
        var obj = {};

        if(isDate) {
          obj["date"] = new Date(+x);
        }
        else {
          obj["key"] = x;
        }

        if(getPerc) {
          // Can only do percentage if query has getTotal set to true
          if(data[amountAccessor]) {
            obj["perc"] = (value / data[amountAccessor][valueAccessor]) * 100;
          }
        }

        flatData.push(addValue(obj, value, "value"));
      }
    }

    if(isDate) {
      flatData.sort(function(a, b){ return a.date - b.date; });
    }

    return flatData;
  }

  return {
    processChord: processChordData,
    processHeatmap: processHeatmapData,
    processBubble: processBubbleData,
    processSimple: processSimpleData
  }
});
