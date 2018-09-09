/**
 * Created by joshrayman on 06/12/2016.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('LegendService', [ 'ChartService', function(ChartService) {
  function addLegend(data, element, height, color, chartType, showOnLoad)
  {
    "use strict";
    var ele = element[0];

    switch(chartType)
    {
        // case "force":
        //   addLegendContent(data, ele, height, color, "circle", "id", "id", "level");
        //       break;
      case "pie":
      case "donut":
        addLegendContent(data, ele, height, color, "g.arc", "key", "key", null, showOnLoad);
        break;
      case "bar":
        addLegendContent(data, ele, height, color, "rect.bar", "key", "key", null, showOnLoad);
        break;
      case "sunburst":
        if(data.children)
        {
          var filteredData = data.children.map(function(d){ return { parent: findParent(d, d.depth), key: d.data.key, depth: d.depth }; });
          addLegendContent(filteredData, ele, height, color, "g.arc", "key", "key");
        }
        break;
      case "chord":
        var chordData = createChordLegendData(data);
        addLegendContent(chordData, ele, height, color, "path", "key", "name");
        break;
        // case "bubble":
        //   var bubbleData = _.map(_.groupBy(data,function(doc){
        //     return doc.type;
        //   }),function(grouped){
        //     return grouped[0];
        //   });
        //
        //   addLegendContent(bubbleData, ele, height, color, "circle", "type", "type", "type", false);
      default:
        break;
    }
  }

  function removeClassByPrefix(el, prefix){
    Array.from(el.classList)
    .filter(function (e) {
      return e.indexOf(prefix) === 0
    })
    .forEach(function (e) {
      el.classList.remove(e);
    });
    return el;
  }

  function hideLegendContent(ele) {
    d3.select(ele)
    .select('div.legend')
    .attr('style', 'display: none');
  }

  function showLegendContent(ele) {
    d3.select(ele)
    .select('div.legend')
    .attr('style', 'display: block')
  }

  function addLegendContent(data, ele, height, color, nodeType, d1Attr, d2Attr, d1Col, showOnLoad)
  {
    ele = d3.select(ele);
    var svg = ele.select("svg");
    var sqSize = 15;
    var offset = 10;

    var legendHeight = data.length * (sqSize + offset);

    if(legendHeight > height)
    {
      sqSize = 10;
      offset = 7.5;
    }

    var legendDiv = ele.select("div.legend");

    legendDiv.selectAll("*").remove();

    data = data.filter(function(d) {
      if(d.id) {
        return d
      }
      else {
        return (d.key !== undefined && d.key !== "null");
      } });

    // add a css class which would allow you to identify how many children the legend contains
    // var domEl = ele.node().querySelector('.legend');
    // var prefix = 'children-count-';
    // removeClassByPrefix(domEl, prefix);
    // if(data.length) {
    //   domEl.classList.add(prefix + data.length);
    // }

    var legendItems = legendDiv
    .append("div")
    .attr("class", "inner-container")

    .selectAll("div.legend-item")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "legend-item")
    .on('mouseover', function (d1) {
      svg.selectAll(nodeType)
      .filter(function(d2) { if(d2){
        if(d2.data) { d2 = d2.data; }

        //console.log(d1.depth, d2);
        //TODO currently missing data to determine depth (duplicate keys currently match)

        return d1[d1Attr] === d2[d2Attr];
      } })
      .classed("active", true);

      d3.select(this).classed("active", true);
      ele.classed("mouse-over", true);
    })
    .on('mouseout', function (d1) {
      svg.selectAll(nodeType)
      .filter(function(d2) { if(d2){ if(d2.data) { d2 = d2.data; } return d1[d1Attr] === d2[d2Attr]; } })
      .classed("active", false);

      d3.select(this).classed("active", false);
      ele.classed("mouse-over", false);

    });

    legendItems.append("div")
    .attr("class", "legend-sq")
    .attr("style", function (d) {
      if(d.parent) {
        d = d.parent;
      }

      var attr = (d1Col) ? d1Col : d1Attr;

      return "background : " + color(d[attr]);
    });

    legendItems.append("span")
    .attr("class", "legend-text")
    .text(function (d) {
      return d[d1Attr];
    });
  }

  /*
   Create flat legend data map.
   */
  function createChordLegendData(mpr) {
    var legendData = mpr.getMap();
    return _.keys(legendData).map(function(d) { return { key: d }; });
  }

  function findParent(d, originalDepth) {
    "use strict";
    return (d.parent === null || d.parent.parent === null) ? { key: d.data.key, depth: originalDepth } : findParent(d.parent, d.depth);
  }

  // highlight element and associated legend items
  function onMouseOver(element, d1, isPie) {
    d3.select(this).classed("active", true);

    d3.select(element[0])
    .classed("mouse-over", true)
    .select("div.legend")
    .selectAll(".legend-item")
    .filter(function(d2){return ChartService.compare(d2, d1, isPie);})
    .classed("active", true);
  }

  // un-highlight element and associated legend items
  function onMouseOut(element, d1, isPie) {
    d3.select(this).classed("active", false);

    d3.select(element[0])
    .classed("mouse-over", false)
    .select("div.legend")
    .selectAll(".legend-item")
    .filter(function(d2){return ChartService.compare(d2, d1, isPie);})
    .classed("active", false);
  }

  return {
    addLegend: addLegend,
    onMouseOver: onMouseOver,
    onMouseOut: onMouseOut,
    showLegendContent: showLegendContent,
    hideLegendContent: hideLegendContent
  };
}]);
