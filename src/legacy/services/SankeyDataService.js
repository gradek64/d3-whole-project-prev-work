
/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('SankeyDataService', function() {
  /**
   * Sankey Data Processing
   * @param data
   * @param accessor
   * @returns {{nodes: Array, links: Array}}
   */
  function processSankeyData(data, target, valueAccessor, createNewObject, addValue)
  {
    function checkValue(level, amountAccessor, valueAccessor) {
      return (level[amountAccessor] !== undefined && level[amountAccessor][valueAccessor] !== 0);
    }
    /**
     * Sankey Nested Data Processing
     * @param data
     * @param accessor
     * @returns {Array}
     */
    function processSankeyNestedData(data, target, valueAccessor)
    {
      var outputArr = [];

      var rows = data;
      var amountAccessor = target;

      for(var x in rows)
      {
        if(x === amountAccessor) { continue; }      //catch lowest leaves (don't try and iterate too far)

        var parent = x;
        var level = rows[x];

        for(var y in level)
        {
          var target = y;

          if(y === amountAccessor)
          {
            continue;
          }
          if(checkValue(level[y], amountAccessor, valueAccessor))
          {
            //level 1
            outputArr.push(
                createNewObject(
                    1 + " / " + parent,
                    2 + " / " + target,
                    level[y][amountAccessor][valueAccessor],
                    1,
                    parent
                )
            );

            processSankeyLevel(outputArr, level[y], parent, target, amountAccessor, valueAccessor, 1);
          }
          else {
            if(checkValue(level, amountAccessor, valueAccessor)) {
              outputArr.push(
                  createNewObject(
                      1 + " / " + parent,
                      2 + " / " + target,
                      level[amountAccessor][valueAccessor],
                      1,
                      parent
                  )
              );
            }
            else {
              processSankeyLevel(outputArr, level[y], parent, target, amountAccessor, valueAccessor, 1);
            }
          }
        }
      }

      return outputArr;
    }

    function processSankeyLevel(outputArr, level, parent, source, amountAccessor, valueAccessor, i) {
      i = i + 1;

      for (var z in level) {
        var target = z;

        if (level.hasOwnProperty(z) && z !== amountAccessor) {
          if (checkValue(level[z], amountAccessor, valueAccessor)) {
            var value = level[z][amountAccessor][valueAccessor];

            //parent is used for coloring consistently
            var obj = {
              parent: parent,
              source: i + " / " + source,
              target: (i + 1) + " / " + target,
              slevel: i,
              tlevel: i + 1
            };

            outputArr.push(addValue(obj, value, "value"));

            processSankeyLevel(outputArr, level[z], parent, target, amountAccessor, valueAccessor, i);
          }
          else {
            if (checkValue(level[z], amountAccessor, valueAccessor)) {
              var value = level[amountAccessor][valueAccessor];

              var obj = {
                parent: parent,
                source: i + " / " + source,
                target: (i + 1) + " / " + target,
                slevel: i,
                tlevel: i + 1
              };

              outputArr.push(addValue(obj, value, "value"));
            }
          }
        }
      }
    }

    var processedData = processSankeyNestedData(data, target, valueAccessor);

    var graph = {"nodes" : [], "links" : [], "total": [] };

    processedData = processedData.filter(function(d){ return (d.value !== 0) });

    processedData.forEach(function (d) {
      if(d.target != "")
      {
        if(d.slevel === 1) {
          graph.total[d.slevel - 1] = (graph.total[d.slevel - 1]) ? graph.total[d.slevel - 1] + d.value : d.value;  // Quick hack for now.
        }

        graph.total[d.tlevel - 1] = (graph.total[d.tlevel - 1]) ? graph.total[d.tlevel - 1] + d.value : d.value;

        graph.nodes.push({ "name": d.source, "level": d.slevel, "isNegative" : d.isNegative });
        graph.nodes.push({ "name": d.target, "level": d.tlevel, "isNegative" : d.isNegative });
        graph.links.push({
          "parent" : d.parent,
          "source": d.source,
          "target": d.target,
          "value": +d.value,
          "isNegative" : d.isNegative });
      }
    });

    // return only the distinct / unique nodes
    graph.nodes = _.uniqBy(graph.nodes, 'name');

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.map(function(d){ return d.name }).indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.map(function(d){ return d.name }).indexOf(graph.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { "id": d.name, "level": d.level, "value": d.value, "isNegative" : d.isNegative };
    });

    return graph;
  }

  return {
    process: processSankeyData
  }
});
