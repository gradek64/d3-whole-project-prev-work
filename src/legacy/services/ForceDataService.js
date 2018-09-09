
/* eslint-disable */
/* prettier-ignore */


angular.module('app').service('ForceDataService', function() {
  function processForceData(plainData, accessor, formatNumber, addValue, processLevel) {
    function processForceNestedData(data, accessor) {

      var outputArr = [];
      var amountAccessor = "distributedCosts.amount";

      var rows = data;
      var valueAccessor = accessor;

      for(var x in rows)
      {
        if(x === amountAccessor)
        {
          continue;
        }

        var source = x;
        var level = data[x];

        for (var y in level) {
          if(y === amountAccessor) { continue; }

          var value = level[y][amountAccessor] ? level[y][amountAccessor][valueAccessor] : 0;

          var obj = {
            source: x,
            target: y,
            value: formatNumber(value),
            slevel: 1,
            tlevel: 2
          };

          outputArr.push(addValue(obj, value, "value"));

          if (level[y][amountAccessor] !== undefined) {
            processLevel(outputArr, level[y], source, y, accessor, "force", 2);
          }
        }
      }

      return outputArr;
    }

    var processedData = processForceNestedData(plainData, accessor);

    var graph = {"nodes" : [], "links" : []};

    processedData.forEach(function (d) {
      graph.nodes.push({ "name": d.source, "level": d.slevel, "value": d.value });
      graph.nodes.push({ "name": d.target, "level": d.tlevel, "value": d.value });
      graph.links.push({ "source": d.source,
        "target": d.target, "value": d.value });
    });
    // return only the distinct / unique nodes
    var newNodes = _.uniqBy(graph.nodes, 'name');

    graph.nodes = newNodes;

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { "id": d.name, "level": d.level, "value": d.value };
    });

    graph.nodes.sort(function(a,b){ return a.level - b.level; });

    return graph;
  }

  return {
    process: processForceData
  }
});
