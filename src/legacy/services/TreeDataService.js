
/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('TreeDataService', function() {
  function processTreeData(data, targetAccessor, accessor, isNull, addValue, formatNumber)
  {
    function processData(plainData, accessor, isNull)
    {
      //TODO total hack
      if(!targetAccessor) {
        targetAccessor = "distributedCosts.amount";
      }

      var amountAccessor = targetAccessor.split(",")[0];
      var targetLength = targetAccessor.split(",").length;
      var valAccessor = accessor;
      var flatData = [];


      for(var a in plainData)
      {
        if (targetAccessor.indexOf(a) > -1 || a === "") {   //catch
          continue;
        }

        var level1 = plainData[a];
        var level1_length = Object.keys(level1).filter(function(d) { return !(d === "") }).length;

        if(level1[amountAccessor] && level1_length === targetLength)
        {
          var value = level1[amountAccessor][valAccessor];

          var obj = {
            level1: a,
            level2: (isNull) ? null : a,
            level3: (isNull) ? null : a
          };

          flatData.push(addValue(obj, value, "total"));
        }
        else {
          for(var b in level1)
          {
            if (targetAccessor.indexOf(b) > -1 || b === "") {   //catch
              continue
            }

            var level2 = level1[b];
            var level2_length = Object.keys(level2).filter(function(d) { return !(d === "") }).length;

            if(level2[amountAccessor] && level2_length === targetLength)
            {
              var value2 = level2[amountAccessor][valAccessor];

              var obj2 = {
                level1: a,
                level2: b,
                level3: (isNull) ? null : b,
              }

              flatData.push(addValue(obj2, value2, "total"));
            }
            else {
              for(var c in level2)
              {
                if (targetAccessor.indexOf(c) > -1 || level2[c] === undefined || level2[c][amountAccessor] === undefined ) {   //catch
                  continue
                }

                var obj3 = {
                  level1: a,
                  level2: b,
                  level3: c,
                  total: formatNumber(level2[c][amountAccessor][valAccessor])
                }

                if(level2[c][amountAccessor])
                {
                  var value3 = level2[c][amountAccessor][valAccessor];

                  var obj3 = {
                    level1: a,
                    level2: b,
                    level3: c,
                  }

                  flatData.push(addValue(obj3, value3, "total"));
                }
              }
            }
          }
        }
      }

      return flatData;
    }

    var flatData = processData(data, accessor, isNull, addValue);

    var rootData = d3.nest()
    .key(function(d) { return d.level1; })
    .key(function(d) { return d.level2; })
    .key(function(d) { return d.level3; })
    .entries(flatData);

    var root = d3.hierarchy({values: rootData }, function(d) { return d.values; })
    .sum(function(d) { return d.total; })
    .sort(function(a, b) { return b.total - a.total; });

    return root;
  }

  return {
    process: processTreeData
  }
});
