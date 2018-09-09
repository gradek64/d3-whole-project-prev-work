/**
 * Created by joshrayman on 20/11/2016.
 *
 * Modified from examples by Steven Hall http://www.delimited.io/blog/2013/12/8/chord-diagrams-in-d3
 * and Mike Bostock's Chord examples http://bl.ocks.org/mbostock/4062006, https://bost.ocks.org/mike/uberdata/
 *
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app')
.service('ChordChartService', [ 'ChartService', 'LegendService', 'TooltipService', 'ChartDataFormat', '$location',
  function(ChartService, LegendService, TooltipService, ChartDataFormat, $location) {
    function init(scope, element, attrs) {
      var id = scope.chartInfo.type + '-' + scope.chartInfo.id;

      scope.margin = { top: 0, left: 0, right: 0, bottom: 15 };

      scope.chartInfo.headers = ["Source", "Target"];

      scope.reverse = false;
      scope.chartInfo.toggleTable = false;

      scope.chartInfo.renderLegend = true;

      angular.element(".chord-table").hide();

      scope.goToSelectedPath = function(selected)
      {
        angular.element("#" + id + "-link").modal("hide");

        var selectedPath = scope.chartInfo.selectedPath;

        var source = selectedPath.route.source;
        var target = selectedPath.route.target;

        if(selected === "reverse")
        {
          source = selectedPath.route.target;
          target = selectedPath.route.source;
        }

        $location.path("/reports/department-consumption/" + source + "/" + target);
      };

      scope.reverseCosts = function()
      {
        scope.reverse = !scope.reverse;
        render(scope, scope.chartInfo.data, element, scope.reverse);
      };
    }

    function resize(scope, element) {
      ChartService.resizeSvg(scope, element);

      var width = scope.width;
      var height = scope.height;

      scope.g
      .attr("transform", "translate(" + (width / 2) + "," + height / 2 + ")");

      var outerRadius = Math.min(width, height) * 0.5 - 40,
          innerRadius = outerRadius - 20;

      var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

      var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

      var ribbon = d3.ribbon()
      .radius(innerRadius);

      var group = scope.g.selectAll("g.groups");
      scope.g.selectAll("g.ribbons").selectAll("path").attr("d", ribbon);

      group.selectAll("path").attr("d", arc);

      group.selectAll(".group-tick")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

      scope.svg.select("g.changeDir")
      .attr("transform", "translate(" + (width - 150) + "," + 10 + ")");
    }

    function render(scope, data, element, reverse) {
      if(data.length === 0) {
        return null;
      }

      var id = scope.chartInfo.type + '-' + scope.chartInfo.id;

      "use strict";
      var mpr = chordMpr(data);

      //TODO: total hack
      var isNegative = data[0].isNegative || false;

      mpr
      .addValuesToMap('source')
      .setFilter(function (row, a, b) {
        if(reverse)
        {
          return (row.source === b.name && row.target === a.name);
        }

        return (row.source === a.name && row.target === b.name);
      })
      .setAccessor(function (recs, a, b) {
        if (!recs[0]) return 0;
        return +recs[0].value;
      });

      var matrix = mpr.getMatrix();
      var mmap = mpr.getMap();

      scope.g.selectAll("g").remove();

      var width = scope.width;
      var height = scope.height;

      var svg = scope.svg;

      var outerRadius = Math.min(width, height) * 0.5 - 40,
          innerRadius = outerRadius - 20;

      var chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

      var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

      var ribbon = d3.ribbon()
      .radius(innerRadius);

      var color = scope.color;

      LegendService.addLegend(mpr, element, scope.height, color, "chord");

      svg.selectAll("g.changeDir").remove();

      var toggleContainer = svg.append("g")
      .on("click", scope.reverseCosts)
      .attr("class", "changeDir")
      .attr("transform", "translate(" + (scope.width - 150) + "," + 10 + ")");

      //  http://vanseodesign.com/web-design/svg-markers/ - add (ie compatability)

      var toggleX = 10;

      toggleContainer.append("circle")
      .attr("r", 20)
      .attr("cx", toggleX)
      .attr("cy", 25)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", "2px");

      var arrowPathFwd = "M" + (toggleX - 5) + ",10 L" + (toggleX - 5) + ",40 L" + (toggleX + 13) + ",25 L" + (toggleX - 5) + ",10";
      var arrowPathBk = "M" + (toggleX + 8) + ",40 L" + (toggleX + 8) + ",10 L" + (toggleX - 13) + ",25 L" + (toggleX + 8) + ",40";

      toggleContainer.append("path")
      .attr("x", toggleX)
      .attr("y", 25)
      .attr("d", (reverse) ? arrowPathBk : arrowPathFwd)
      .attr("fill", "black");

      toggleContainer.append("text")
      .attr("x", 40)
      .attr("y", 30)
      .attr("fill", "black")
      .text((scope.reverse) ? "Costs Received" : "Costs Sent");

      var rdr = chordRdr(matrix, mmap);

      var g = scope.g
      .attr("transform", "translate(" + (width / 2) + "," + height / 2 + ")")
      .datum(chord(matrix));

      var group = g.append("g")
      .attr("class", "groups")
      .selectAll("g")
      .data(function(chords) { return chords.groups; })
      .enter().append("g");

      var groupPath = group.append("path")
      .style("fill", function(d) { d.name = rdr(d).gname; return color(rdr(d).gname); })
      .style("stroke", function(d) { return d3.rgb(color(rdr(d).gname)).darker(); })
      .attr("id", function(d, i) { return "group" + i; })
      .attr("d", arc)
      .on("mouseover", function(d, index){
        onMouseOverGroup.call(this, scope, element, d, index, rdr);
      })
      .on("mouseout", function (d) {
        onMouseOutGroup.call(this, scope, element, d);
      });

      // Add a text label.
      var groupText = group.append("text")
      .attr("x", 6)
      .attr("dx", 5)
      .attr("dy", 15);

      groupText.append("textPath")
      .attr("xlink:href", function(d, i) { return "#group" + i; })
      .text(function(d, i) { return d.name; });

      //hide text labels that are too long
      groupText.select("textPath").attr("class", function(d,i) {
        return (groupPath._groups[0][i].getTotalLength() / 2 - 25 < this.getComputedTextLength()) ? "hidden" : "";
      });

      var groupTick = group.selectAll(".group-tick")
      .data(function(d) { return groupTicks(d, 25e2); })
      .enter().append("g")
      .attr("class", "group-tick")
      .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

      groupTick.append("line")
      .attr("x2", 6);

      groupTick
      .append("text")
      .attr("x", 8)
      .attr("dy", ".35em")
      .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
      .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .text(function(d) { return ChartDataFormat.formatNumber(d.value); });

      var ribbons = g.append("g")
      .attr("class", "ribbons")
      .selectAll("path")
      .data(function(chords) { return chords; })
      .enter().append("path")
      .attr("d", ribbon)
      .style("fill", function(d) { return color(rdr(d.source).gname); })
      .style("stroke", function(d) { return d3.rgb(color(rdr(d.source).gname)).darker(); })
      .on("click", function(data) {
        var d = rdr(data);

        var updateData = true;

        if(scope.chartInfo.selectedPath && d.sname === scope.chartInfo.selectedPath.route.source &&
            d.tname === scope.chartInfo.selectedPath.route.target)
        {
          updateData = false;
        }

        var p = d3.format(".2%"), q = d3.format(",.3r");

        //TODO: hack
        var multi = (isNegative) ? -1 : 1;

        scope.chartInfo.selectedPath = {
          route: { source: d.sname, target: d.tname },
          values: [{ total: q(d.svalue * multi), perc: p(d.svalue/d.stotal) }, { total: q(d.tvalue * multi), perc: p(d.tvalue/d.ttotal) }]
        };

        scope.chartInfo.toggleTable = (!updateData) ? !scope.chartInfo.toggleTable : true;

        scope.$digest();
      })
      .on("mouseover", function (d) {
        onMouseOverRibbon.call(this, scope, element, d, rdr);
      })
      .on("mouseout", function (d) {
        onMouseOutRibbon.call(this, scope, element, d, rdr);
      });
    }

    function onMouseOverGroup(scope, element, d, index, rdr) {
      d3.select(this).classed("active", true);

      d3.select(element[0]).selectAll(".ribbons path")
      .attr("class", function(p) {
        return p.source.index !== index && p.target.index !== index ? "fade-ribbon" : "active-group";
      });



      d3.select(element[0]).select(".legend").selectAll(".legend-item")
      .filter(function(d2) { return rdr(d).gname === d2.key; })
      .classed("active", true);

      var text = ChartDataFormat.formatChordGroup(rdr(d));
      TooltipService.showTooltip(element, text);
    }

    function onMouseOutGroup(scope, element, d) {
      d3.select(this).classed("active", false);
      d3.select(element[0]).selectAll(".ribbons path.fade-ribbon").classed("fade-ribbon", false);
      d3.select(element[0]).selectAll(".ribbons path.active-group").classed("active-group", false);

      d3.select(element[0]).select(".legend").selectAll(".legend-item.active").classed("active", false);

      TooltipService.hideTooltip(element);
    }

    function onMouseOverRibbon(scope, element, d, rdr) {

      d3.select(element[0]).selectAll(".ribbons path").classed("fade-ribbon", true);
      d3.select(this).classed("fade-ribbon", false);

      var text = ChartDataFormat.formatChordTip(rdr(d));
      TooltipService.showTooltip(element, text);
    }

    function onMouseOutRibbon(scope, element, d) {
      d3.select(element[0]).selectAll(".ribbons path").classed("fade-ribbon", false);

      TooltipService.hideTooltip(element);
    }

    // Returns an array of tick angles and values for a given group and step.
    function groupTicks(d, step) {
      var k = (d.endAngle - d.startAngle) / d.value;
      return [{
        name: d.name,
        value: d.value,
        angle: d.value * k + d.startAngle
      }];
    }

    //*******************************************************************
    //  CHORD MAPPER
    //*******************************************************************
    function chordMpr (data) {
      var mpr = {}, mmap = {}, n = 0,
          matrix = [], filter, accessor;

      mpr.setFilter = function (fun) {
        filter = fun;
        return this;
      },
          mpr.setAccessor = function (fun) {
            accessor = fun;
            return this;
          },
          mpr.getMatrix = function () {
            matrix = [];
            _.each(mmap, function (a) {
              if (!matrix[a.id]) matrix[a.id] = [];
              _.each(mmap, function (b) {
                var recs = _.filter(data, function (row) {
                  return filter(row, a, b);
                })
                matrix[a.id][b.id] = accessor(recs, a, b);
              });
            });
            return matrix;
          },
          mpr.getMap = function () {
            return mmap;
          },
          mpr.printMatrix = function () {
            _.each(matrix, function (elem) {
              console.log(elem);
            })
          },
          mpr.addToMap = function (value, info) {
            if (!mmap[value]) {
              mmap[value] = { name: value, id: n++, data: info }
            }
          },
          mpr.addValuesToMap = function (varName, info) {
            var values = _.uniq(_.map(data, varName));
            _.map(values, function (v) {
              if (!mmap[v]) {
                mmap[v] = { name: v, id: n++, data: info }
              }
            });
            return this;
          };
      return mpr;
    }

    //*******************************************************************
    //  CHORD READER
    //*******************************************************************
    function chordRdr (matrix, mmap) {
      return function (d) {
        var i,j,s,t,g,m = {};
        if (d.source) {
          i = d.source.index; j = d.target.index;
          s = _.filter(mmap, {id: i });
          t = _.filter(mmap, {id: j });
          m.sname = s[0].name;
          m.sdata = d.source.value;
          m.svalue = +d.source.value;
          m.stotal = _.reduce(matrix[i], function (k, n) { return k + n }, 0);
          m.tname = t[0].name;
          m.tdata = d.target.value;
          m.tvalue = +d.target.value;
          m.ttotal = _.reduce(matrix[j], function (k, n) { return k + n }, 0);
          m.isNegative = d.source.isNegative;
        } else {
          g = _.filter(mmap, {id: d.index });
          m.gname = g[0].name;
          m.gdata = g[0].data;
          m.gvalue = d.value;
        }
        m.mtotal = _.reduce(matrix, function (m1, n1) {
          return m1 + _.reduce(n1, function (m2, n2) { return m2 + n2}, 0);
        }, 0);
        return m;
      };
    }

    return {
      type: "chord",
      init: init,
      render: render,
      resize: resize
    };
  }]);
