/**
 * Created by joshrayman on 21/10/2016.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module("app").service("SankeyChartService",  ['ChartDataFormat', 'CostQueryParameter','TooltipService', function (ChartDataFormat, CostQueryParameter,TooltipService) {
  var margin, width, height, format, color, svg, sankey, path, target;

  var sankeyData = { all: CostQueryParameter.classifications, selected: null };

  function init(scope, element, attrs) {

    var initWidth = scope.width;
    var initHeight = scope.height;
    var initTarget = element;
    var isDynamic = scope.chartInfo.dynamicSource;

    scope.margin = { top: 20, right: 0, bottom: 50, left: 0 };
    margin = scope.margin;

    scope.color = d3.scaleOrdinal(scope.chartInfo.colors);

    target = initTarget;

    width = initWidth - margin.left - margin.right;
    height = initHeight - margin.top - margin.bottom;

    format = function(d) {
      return ChartDataFormat.formatNumber(d);
    },
        color = scope.color;

    svg = scope.g.attr("transform", "translate(" + margin.left + "," + 0 + ")");

    svg.append("rect")
    .attr("class", "placeholder")
    .attr("width", 15)
    .attr("height", height - margin.top - margin.bottom - 100)
    .attr("x", margin.left)
    .attr("y", 10)
    .attr("fill", "none");

    svg.append("text")
    .attr("class", "placeholder")
    .attr("width", 15)
    .attr("height", height - margin.top - margin.bottom - 100)
    .attr("x", 40)
    .attr("y", (height - margin.top - margin.bottom - 100) / 2)
    .attr("fill", "#ccc")
    .text(scope.chartInfo.name);

    scope.chartInfo.headers = ["Source", "Target"];

    scope.chartInfo.sankeyClassification = angular.copy(sankeyData);

    delete scope.chartInfo.sankeyClassification.all.INFRASTRUCTURE; // unneeded on sankey

    if(scope.chartInfo.dynamicSource === true) {
      scope.chartInfo.sourceGrouping = angular.copy(scope.chartInfo.sankeyClassification);
    }

    if(scope.chartInfo.preselectSankey) {
      var opts = scope.chartInfo.preselectSankey;
      scope.chartInfo.sankeyClassification.selected = scope.chartInfo.sankeyClassification.all[opts[0]];
    }

    scope.$on('redrawSankey', function(){
      scope.resizeChart(scope, element);
    });
  }

  function render(scope, graph, element)
  {
    var id = scope.chartInfo.type + '-' + scope.chartInfo.id;

    sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([scope.width, scope.height]);

    path = sankey.link();

    svg = scope.g;

    color = scope.color;

    svg.selectAll("g").remove();
    svg.select("#error").remove();

    if(graph.nodes.length > 1000) {
      console.log("Too many nodes - please filter");

      svg.append("text")
      .text("Error: Too many nodes - please filter")
      .attr("id", "error")
      .attr("x", 10)
      .attr("y", 10);

      return null;
    }

    if(graph.nodes.length > 0) {
      d3.selectAll(".placeholder").remove();
    }

    var parentCount = graph.nodes.filter(function(d) { return (d.level === 1) }).length;

    sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

    var link = svg.append("g").attr("class", "parent").selectAll(".link")
    .data(graph.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .attr("stroke", function(d) {
      //d.parent is always valid because at the top level it is a copy of source, even though originally a single sankey would use d.source.id
      return d.color = color(d.parent);
    })
    .style("stroke-width", function(d) {
      return Math.max(1, d.dy);
    })
    .sort(function(a, b) {
      return b.dy - a.dy;
    })
    .on("click", function(originData) {
      if(scope.chartInfo.dynamicSource === true) {
        //store selected table data to page for modal
        scope.chartInfo.selectedPath = angular.copy(originData);

        var d = scope.chartInfo.selectedPath;

        scope.chartInfo.selectedPath.source.name = getId(d.source.id);
        scope.chartInfo.selectedPath.target.name = getId(d.target.id);

        scope.chartInfo.selectedPath.perc = format(+d.value / +d.source.value * 100);

        scope.chartInfo.selectedPath.value = format(+d.value);
        scope.chartInfo.selectedPath.source.value = format(+d.source.value);

        scope.$digest();
        angular.element("#" + id + "-table").modal("show");
      }
    })
    .on("mouseover", function(d) {
      // onMouseOver.call(this, scope, element, d);
      d3.selectAll("path.link")
      .classed("hover", function (d2) {
        return (parentCount > 1 && d.parent === d2.parent)
      })
      .classed("fade-link", function (d2) {
        return (parentCount > 1 && d.parent !== d2.parent)
      });

      var text = ChartDataFormat.formatSankeyText(d, getId);
      TooltipService.showTooltip(element, text);
    })
    .on("mouseout", function (d) {
      d3.selectAll("path.link")
      .classed("hover", false)
      .classed("fade-link", false);

      if(!element[0].classList.contains("collapse-left")) {
        TooltipService.hideTooltip(element);
      }
    });

    // link.append("title")
    //   .text(function(d) { return ChartDataFormat.formatSankeyText(d, getId); });

    svg.append("g").attr("class", "parent").selectAll(".totalNode")
    .data(graph.total)
    .enter().append("g")
    .attr("class", "totalNode")
    .attr("transform", function(d, i) {
      var x = (graph.total.length < 2) ? (scope.width - 100) * i : (scope.width / (graph.total.length - 1)) * i;

      if((i + 1) === graph.total.length && (graph.total.length !== 1)) {
        x = (scope.width - 100);
      }

      return "translate(" + x + "," + 0 + ")";

    })
    .append("text")
    .text(function(d){
      var totalText = format(d);
      return totalText === "NaN" ? "" : totalText; });

    var node = svg.append("g").attr("class", "parent").selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .on("mouseover", function(d) {
      d3.selectAll("path.link")
      .classed("hover", function(d2){
        return (d.id.split(" / ")[1] === d2.parent)
      })
      .classed("fade-link", function(d2){
        //bit hack - stops everything being faded on intermediate levels, as you can only track the root nodes.
        return (d.id.split(" / ")[1] !== d2.parent && d.id[0] === "1")
      });
    })
    .on("mouseout", function (d) {
      d3.selectAll("path.link")
      .classed("hover", false)
      .classed("fade-link", false);
    })
    .call(d3.drag()
    .subject(function(d) {
      return d;
    })
    .on("start", function() {
      this.parentNode.appendChild(this);
    })
    .on("drag", dragmove));

    node.append("rect")
    .attr("height", function(d) {
      return (d.dy > 0) ? d.dy : Math.abs(d.dy);
    })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) {
      //grey for multi-level/dynamic sankey; colored otherwise
      return d.color = scope.chartInfo.dynamicSource ? "#ccc" : color(d.id.split(" / ")[1]);
    })
    .style("stroke", function(d) {
      //black for multi-level/dynamic sankey; colored otherwise
      return scope.chartInfo.dynamicSource ? "#000" : d3.rgb(d.color).darker(1);
    })
    // .append("title")
    // .text(function(d) {
    //   return ChartDataFormat.formatSankeyNodeText(d, getId);
    // });

    node.append("text")
    .attr("x", -6)
    .attr("y", function(d) {
      return d.dy / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) {
      return ChartDataFormat.formatSankeyNodeText(d, getId);
    })
    .filter(function(d) {
      return d.x < scope.width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

    function dragmove(d) {
      d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
      sankey.relayout();
      link.attr("d", path);
    }

    resize(scope, element);
    d3.select(element[0]).select(".loading").classed("hidden", true);
  }

  function getId(id) {
    if(id.indexOf("/ ") > -1) {
      id = id.split("/ ")[1];
    }
    return id;
  }

  function calculateHeightMultiplier(scope) {
    var heightMultiplier = 0;

    //expands when node array size is large.
    if(scope.chartInfo.data && scope.chartInfo.data.nodes) {
      heightMultiplier = scope.chartInfo.data.nodes.length * 12;
    }

    var baseHeight = (scope.chartInfo.height === "full") ? (document.documentElement.clientHeight * 0.5) : 520;

    return baseHeight + heightMultiplier;
  }

  function resize(scope, element) {
    scope.height = calculateHeightMultiplier(scope);

    if(scope.chartInfo.data === undefined) {
      return;
    }

    width = scope.width;
    height = scope.height;
    var data = scope.chartInfo.data;
    var heightPadding = 0;  // extra 200 to counter the sankey bleeding past the svg container

    svg = scope.svg
    .attr("height", scope.height + margin.top + margin.bottom + heightPadding)
    .selectAll("g.parent")
    .attr("transform", "translate(" + 0 + "," + 5 + ")"); // total offset

    svg.selectAll("rect.placeholder")
    .attr("height", height - margin.top - margin.bottom);

    svg.selectAll("text.placeholder")
    .attr("height", height - margin.top - margin.bottom - 100)
    .attr("y", (height - margin.top - margin.bottom) / 2);

    sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);

    path = sankey.link();

    var graph = data;

    sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

    var link = svg.selectAll(".link")
    //.transition().duration(dur)
        .attr("d", path)
        .style("stroke-width", function(d) {
          return Math.max(1, d.dy);
        });

    var node = svg.selectAll(".node")
    //.transition().duration(dur)
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

    node.selectAll("rect")
    //.transition().duration(dur)
        .attr("height", function(d) {
          return (d.dy > 0) ? d.dy : 0;
        })
        .attr("width", sankey.nodeWidth());

    node.select("text")
    //.transition().duration(dur)
        .attr("y", function(d) {
          return d.dy / 2;
        })
        .attr("dy", ".35em")
    .filter(function(d) {
      return d.x < width / 2;
    })
    .attr("x", 6 + sankey.nodeWidth());


    svg.selectAll(".totalNode")
    .attr("transform", function(d, i) {
      var x = (scope.chartInfo.data.total.length < 2) ? (scope.width - 100) * i : (scope.width / (scope.chartInfo.data.total.length - 1)) * i;

      if((i + 1) === scope.chartInfo.data.total.length && (scope.chartInfo.data.total.length !== 1)) {
        x = (scope.width - 100);
      }

      // console.log(x);

      return "translate(" + x + "," + -10 + ")";

    });
  }

  function onMouseOver(scope, element, d, dataTotal) {
    var text = ChartDataFormat.formatSankeyText(d, getId);
    TooltipService.showTooltip(element, text);
  }

  function onMouseOut(scope, element, d) {
    if(!element[0].classList.contains("collapse-left")) {
      TooltipService.hideTooltip(element);
    }
  }

  return {
    type: "sankey",
    init: init,
    render: render,
    resize: resize
  };
}]);
