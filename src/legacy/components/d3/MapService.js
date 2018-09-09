/**
 * Created by joshrayman on 27/01/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('MapService', ['ChartDataFormat', 'TooltipService', 'mapLocationService', function(ChartDataFormat, TooltipService, mapLocationService) {
  var MOCK_LOCATIONS = [
    {name: "Undefined", location: {"latitude": 29.532804, "longitude": -55.491477 } },
    {name: "Colombo", location: {"latitude" : 6.9271, "longitude" : 79.8612} },
    {name: "London", location: {"latitude" : 51.5074, "longitude" : 0.1278} },
    {name: "Delaware", location: {"latitude" : 38.9108, "longitude" : -75.5277} },
    {name: "Moscow", location: {"latitude" : 55.7558, "longitude" : 37.6173} },
    {name: "Krakow", location: {"latitude": 50.0647, "longitude": 19.9450 } },
    {name: "United Kingdom", location: {"latitude" : 51.5074, "longitude" : 0.1278} },
    {name: "United States of America", location: {"latitude" : 38.9072, "longitude" : -77.0369} },
    {name: "Sri Lanka", location: {"latitude" : 6.9271, "longitude" : 79.8612} },
    {name: "New York", location: {"latitude" : 40.7128, "longitude" : -74.0059} },
    {name: "Seattle", location: {"latitude" : 47.6062, "longitude" : -122.3321} },
    {name: "Croydon", location: {"latitude" : 51.3762, "longitude" : 0.0982} },
    {name: "Paris", location: {"latitude" : 48.8566, "longitude" : 2.3522} }
  ];

  //TODO we will need to make this a more general process at some point - possibly q against a table of locations?
  function processLocationData(plainData, costQuery, countType) //Add accessor so we do not use count
  {
    if(!plainData) { return null; }

    var outputData = [];

    for(var x in plainData)
    {
      var columnWithUnits;

      switch(x)
      {
        case "Colombo":
        case "Columbo":
          columnWithUnits = MOCK_LOCATIONS[1];
          break;

        case "Earl St":
        case "London":
          columnWithUnits = MOCK_LOCATIONS[2];
          break;

        case "Croydon":
          columnWithUnits = MOCK_LOCATIONS[11];
          break;

        case "Paris":
          columnWithUnits = MOCK_LOCATIONS[12];
          break;

        case "Delaware":
          columnWithUnits = MOCK_LOCATIONS[3];
          break;

        case "Moscow":
          columnWithUnits = MOCK_LOCATIONS[4];
          break;

        case "Krakow":
          columnWithUnits = MOCK_LOCATIONS[5];
          break;

        case "United Kingdom":
          columnWithUnits = MOCK_LOCATIONS[6];
          break;

        case "United States of America":
          columnWithUnits = MOCK_LOCATIONS[7];
          break;

        case "Sri Lanka":
          columnWithUnits = MOCK_LOCATIONS[8];
          break;

        case "New York":
          columnWithUnits = MOCK_LOCATIONS[9];
          break;

        case "Seattle":
          columnWithUnits = MOCK_LOCATIONS[10];
          break;

        default:
          columnWithUnits = MOCK_LOCATIONS[0];
          break;
      }

      var count = 0;

      switch(countType) {
        case "countSum":
          // for(var y in plainData[x]) {
            count += plainData[x][costQuery.target][costQuery.accessor];
          // }
          columnWithUnits.units = count;
          break;
        case "count":
          for(var y in plainData[x]) {
            count += 1;
          }
          break;
        default:
          count = plainData[x][costQuery.target][costQuery.accessor];
          break;
      }

      columnWithUnits.units = count;
      outputData.push(columnWithUnits);
    }

    return outputData;
  }

  /**
   * Initialise cities on map
   * @param g
   * @param projection
   * @param data
   * @returns {null}
   */
  function loadCities(g, projection, data, pos) {
    if(!data) { return null; }

    d3.select("#tooltip")
    .style("top", pos.x + "px")
    .style("left", pos.y + "px");

    var marker = g.selectAll("g.marker")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "marker")
    .on("mouseover", function (d) {
      d3.select("#tooltip")
      .style("visibility", "visible")
      .html(ChartDataFormat.formatSimpleTooltip(d.name, d.units))
    })
    .on("mouseout", function (d) {
      d3.select("#tooltip").style("visibility", "hidden");
    });

    //create map marker (IE11 has no foreignObject so had to forego the more convenient font awesome version.
    createCone(marker);

    //add counter
    //TODO: (needs to be made responsive - based on the width of text)
    var count = g.selectAll("g.count")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "count");

    count.append("rect")
    .attr("class", "count-sq")
    .attr("width", function(d){
      //+3 pads out single digit numbers
      return String(ChartDataFormat.formatNumber(d.units)).length * 9 + 3;
    })
    .attr("height", 20);

    count.append("text")
    .attr("text-anchor", "start")
    .text(function(d,i) {
      return ChartDataFormat.formatNumber(d.units);
    });

    //call positioning code
    repositionCities(g, projection);
  }

  /**
   * Create svg map marker (cone code from kpi prototype)
   * @param cone
   */
  function createCone(cone)
  {
    var width = 40,
        height = 40;

    var pathVals = [
      { x: width * 0.25, y: height * 0.55 },
      { x: width * 0.5, y: height},
      { x: width * 0.75, y: height * 0.55 }
    ];

    var d = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })(pathVals);

    cone.append("path")
    .attr("d", d);

    cone.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", width / 4);

    cone.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", width / 8)
    .attr("fill", "#fff");

  }

  /**
   * Get map projection x,y
   * @param d             data point (source lat/long)
   * @param projection    projection function (maps onto x,y pixel co-ords)
   * @returns {*}
   */
  function getProj(d, projection)
  {
    return projection([d.location.longitude, d.location.latitude]);
  }

  /**
   * Position cities (markers, count & tooltip) on map
   * @param g
   * @param projection
   */
  function repositionCities(g, projection)
  {
    var width = 40,
        height = 40;

    var markers = g.selectAll("g.marker")
    .attr("transform",
        function(d){
          var proj = getProj(d, projection);
          return "translate(" + (proj[0] - 20) + "," + (proj[1] - 40) + ")";
        });

    var pathVals = [
      { x: width * 0.25, y: height * 0.55 },
      { x: width * 0.5, y: height},
      { x: width * 0.75, y: height * 0.55 }
    ];

    var d = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })(pathVals);

    markers.selectAll("path")
    .attr("d", d);

    var count = g.selectAll("g.count");

    count.selectAll("rect")
    .attr("x", function(d) { return getProj(d, projection)[0] + 8; })
    .attr("y", function(d) { return getProj(d, projection)[1] - 40; });

    count.selectAll("text")
    .attr("x", function(d) { return getProj(d, projection)[0] + 10; })
    .attr("y", function(d) { return getProj(d, projection)[1] - 25; });
  }


  var DEFAULT_ZOOM = 4;
  var DEFAULT_TRANSFORM_X = 0;
  var DEFAULT_TRANSFORM_Y = 0;

  var zoomEnabled = false;
  var disableDrag = false;

  function init(scope, element, attrs)
  {
    window.addEventListener('touchstart', function() {
      disableDrag = true;
    });

    scope.zoomChart = function(d){
      zoomEnabled = !zoomEnabled;

      return ChartService.zoom(scope, element, d, resize)
    };

    scope.zoomIn = function() {
      return zoom(1);
    };

    scope.zoomOut = function() {
      return zoom(-1);
    };

    scope.reset = function()
    {
      scope.k = DEFAULT_ZOOM;
      scope.transformX = DEFAULT_TRANSFORM_X;
      scope.transformY = DEFAULT_TRANSFORM_Y;

      repositionMap();
    };

    function zoom(dir) {
      scope.k = (scope.k || DEFAULT_ZOOM) + dir;
      scope.transformX = scope.transformX || DEFAULT_TRANSFORM_X;
      scope.transformY = scope.transformY || DEFAULT_TRANSFORM_Y;

      repositionMap();
    }

    /**
     * move map (pan or zoom) based on new params (stored in scope)
     * big issues with unit testing this because of it's dependence on scope.
     */
    function repositionMap()
    {
      var g = scope.svg.select("g");

      var projection = d3.geoMercator()
      .scale((scope.width/640) * 50 * (scope.k * 0.5))
      .translate([
        scope.width/2 + scope.xOffset + scope.transformX,
        scope.height/2 + scope.yOffset + scope.transformY]);

      var path = d3.geoPath()
      .projection(projection);

      g.selectAll("path")
      .attr("d", path);

      repositionCities(g, projection);
    }

    scope.detailLabels = scope.chartInfo.detailLabels;
    scope.footerOffset = 0;

    scope.transformX = DEFAULT_TRANSFORM_X;
    scope.transformY = DEFAULT_TRANSFORM_Y;

    scope.ele = element;
    scope.target = element[0];
    scope.isZoomed = false;

    scope.xOffset = 0;
    scope.yOffset = 125;

    scope.level = 1;

    scope.chartInfo.chartToggle = true;

    scope.margin = {top: 0, right: 0, bottom: 0, left: 0};
    scope.formatNumber = ChartDataFormat.formatNumber;

    if(scope.height < 0) {
      scope.height = 100;
    }
  }

  function render(scope, data, element) {
    if(!data || data.length === 0) {
      throw new Error("No Chart Data");
    }

    // console.log('map-------data', data);

    d3.json("legacy/data/map.json", function (error, world) {
      if(error) {
        console.warn(error);
        return;
      }
      var data = processLocationData(scope.chartInfo.data, scope.chartInfo.query, scope.chartInfo.countType);

      scope.g.selectAll("g").remove();

      var k = scope.k || DEFAULT_ZOOM;
      var projection = d3.geoMercator().scale((scope.width / 640) * 50 * (k * 0.5)).translate([scope.width / 2 + scope.xOffset, scope.height / 2 + scope.yOffset]);

      var path = d3.geoPath()
      .projection(projection);

      var g = scope.g;

      // Load the cities so they appear over the MoW

      // console.log('map--------world', world);
      g.selectAll("path")
      .data(topojson.feature(world, world.objects.countries).features)
      .enter()
      .append("path")
      .attr("class", "country-back")
      .attr("d", path)
      .attr("title", function (d) {
        return d.properties.name;
      })
      //.attr("style", "fill:#2390DC;fill-opacity:1;stroke-opacity:0.9");
          .attr("style", "fill:#fff;fill-opacity:1;stroke-opacity:1;stroke:#285767");

      var pos = TooltipService.getTooltipPosition(scope, "top");

      loadCities(g, projection, data, pos);

      // zoom and pan
      var zoom = d3.zoom()
      .scaleExtent([1, 1])
      .on("zoom", function () {
        var k = scope.k || DEFAULT_ZOOM;

        if (!disableDrag || zoomEnabled) {
          scope.transformX = d3.event.transform.x;
          scope.transformY = d3.event.transform.y;
        }

        var projection = d3.geoMercator()
        .scale((scope.width / 640) * 50 * (k * 0.5))
        .translate([scope.width / 2 + scope.xOffset + scope.transformX, scope.height / 2 + scope.yOffset + scope.transformY]);

        var path = d3.geoPath()
        .projection(projection);

        g.selectAll("path")
        .attr("d", path);

        repositionCities(g, projection);
      });

      scope.svg.call(zoom);

    });
  }

  function resize(scope, element)
  {
    var k = scope.k || DEFAULT_ZOOM;
    var scaleMulti = (k * 0.5) * 50;

    // scope.height
    console.log( 'scope.g', scope.g.node().getBBox().height );


    scope.yOffset = (scope.g.node().getBBox().height - scope.height) /2;

    var projection = d3.geoMercator().scale((scope.width/640) * scaleMulti).translate([scope.width/2 + scope.xOffset, scope.height/2 + scope.yOffset]);

    scope.svg
    .attr("width", scope.width)
    .attr("height", scope.height);

    var path = d3.geoPath()
    .projection(projection);

    var g = scope.svg.select("g");

    g.selectAll("path")
    .attr("d", path);

    repositionCities(g, projection);
  }

  return {
    type: "map",
    processLocationData: processLocationData,
    loadCities: loadCities,
    repositionCities: repositionCities,

    init: init,
    render: render,
    resize: resize
  }

}]);
