/**
 * Created by joshrayman on 21/10/2016.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').factory('TreemapService',  [ 'SliderService', 'ChartDataFormat',
  function ( SliderService, ChartDataFormat) {

    /* PREFACE:
          This was the first d3 code written for SEE and as a result it looks fundamentally different to other
          parts of the code. It originally wasn't a directive, it was a function that handled all the draw code
          which was retrofitted to the current layout, but haphazardly. Hopefully I will have improved it somewhat
          after writing this, but in case I haven't, the init, render and resize were the directive functions appended
          later on, draw/redraw were the original functions written to prototype the layout and get it up and running.

          This does not follow much of the convention that was established later.
    */

    var annotations, level, footerOffset, currentData,
        transitioning, width, height, margin, containerRoot, x, y, treemap,
        container, scope;

    function init(newScope, element) {
      scope = newScope;

      scope.dragDropManager = {
        dragged: null,
        droppable: null
      };

      // annotations = AnnotationsFactory.annotations(scope);
      //
      // scope.annotations = annotations.createAnnotationsScopeObject();
      // annotations.createIcons();
      // annotations.bindAddText();

      //TODO transition is probably killing the resize.

      level = 1;
      footerOffset = 150;

      scope.margin = {top: 10, right: 0, bottom: 0, left: 0};
      scope.formatNumber = ChartDataFormat.formatNumberText;

      if(height < 0) {
        height = 100;
      }

      container = d3.select(element[0]);

      containerRoot = d3.select(element[0]).select(".canvas");

      if(annotations) {
        container.append("div")
        .attr("class", "footnotes hidden");
      }
    }

    function setLevel(l) {
      level = l;

      changeLevel();
    }

    function getLevel() {
      return level;
    }

    function destroy() {
      scope.g.selectAll("g")
      .remove();
    }

    function calcRectStrokeWidth(d) {
      var strokeWidth = 0;

      if(d.parent && d.parent.children && d.parent.children.length > 1) {
        strokeWidth = 2;
      }

      return strokeWidth;
    }

    function findParent(d)
    {
      "use strict";
      return (!d.parent || d.parent.parent === null) ? d.data.key : findParent(d.parent);
    }

    function display(d) {
      scope.g.selectAll("g.depth").remove();

      var g1 = scope.g.insert("g")
      .datum(d)
      .attr("class", "depth");

      container.select(".tree-back").datum(d.parent)
      .on("click", transition);

      container.select(".tree-breadcrumb").text(name(d).substr(0, name(d).length - 3));

      var g = g1.selectAll("g")
      .data(function(d){
        return d.children || [d];
      })
      .enter().append("g")
      .attr("class", "parent cell");

      var parents  = g.append("rect")
      .attr("class", "parent")
      .call(rect)
      .attr("fill", function(d, i){
        var target = findParent(d);
        return scope.color(target);
      });

      parents.on('mouseover',function(d){
        if(scope.dragDropManager) {
          scope.dragDropManager.droppable = d;
        }
      });

      parents.on('mouseout',function(e){
        if(scope.dragDropManager) {
          scope.dragDropManager.droppable = null;
        }
      });

      addChildren(g, scope.g, parents);
      SliderService.updateSlider(level, containerRoot);
      return g1;
    }

    function transition(d) {
      //if already in transition, if data is null or if the depth is greater than 2 (catches viz trying to go to null values)
      //Note: a little brittle, some examples don't go 3 deep so there is probably a better way to this.
      if (transitioning || !d || d.depth > 2) return;
      transitioning = true;
      currentData = d;

      var isParent = (d.parent === null);

      containerRoot.selectAll(".lvl").classed("invisible", !isParent);

      // Update the domain only after entering new elements.
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      var g1 = containerRoot.select("g.depth");
      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);
      //transitions disabled because they caused problems with grabbing CSS properties from the dom
      //(grabbing them mid-transition, too early)

      // Enable anti-aliasing during the transition.
      scope.g.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      scope.g.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(textPos, true).style("fill-opacity", 0);
      t2.selectAll("text").call(textPos, true).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect, true).attr("style", "stroke-width:0");
      t2.selectAll("rect").call(rect, true).attr("class", "hide-stroke");

      // Disabled due to transitions being disabled. Remove the old node when the transition is finished.
      t1.remove().on("end", function() {
        scope.g.style("shape-rendering", "crispEdges");
        transitioning = false;

        if(annotations) {
          annotations.updateAnnotations(level, g2);
        }
      });
    }

    function addChildren(g, svg, parents)
    {
      svg.selectAll("text.parent").remove();
      svg.selectAll(".child2").remove();
      svg.selectAll(".child3").remove();
      svg.selectAll("title").remove();

      var children = g.selectAll(".child2")
      .data(function(d) {
        return d.children || [d];
      }).enter();

      var childG = children.append("g")
      .attr("class", "child2 cell no-click");

      switch(level) {
        case 1:
          renderLevelOne(g, parents, childG);
          break;
        case 2:
          renderLevelTwo(childG);
          break;
        case 3:
          renderLevelThree(childG);
          break;
      }
    }

    function drawRect(target, widthOffset)
    {
      var newRect = target
      .append("rect")
      .call(rect)
      .attr("fill", "none")
      .attr("style", function(d){ return "opacity:0.05;stroke-width:" + (+calcRectStrokeWidth(d) - widthOffset) + "px" });

      return newRect;
    }

    function drawSubChildren(children)
    {
      var subChildren = children.selectAll(".child3" )
      .data(function(d) {
        return d.children || [d];
      })
      .enter()
      .append("g")
      .attr("class", "child3 cell no-click");

      var subChildRect = drawRect(subChildren, 0);

      return {
        g: subChildren,
        rect: subChildRect
      };
    }

    function renderLevelOne(g, parents, children)
    {
      drawRect(children, 1);

      g.append("text").call(text).attr("class", "parent no-click");
      parents.on("click", transition);

      parents.append("title")
      .text(function(d) { return getKey(d) + ": " + scope.formatNumber(d); });
    }

    function renderLevelTwo(children)
    {
      var childRect = drawRect(children, 1);

      drawSubChildren(children);
      children.append("text").call(text).attr("class", "child2 no-click");

      addChildRectProperties(childRect, className);
    }

    function renderLevelThree(children)
    {
      var child = drawRect(children, 1);
      child.attr("style", function(d){ return "opacity:0.25;stroke-width:" + calcRectStrokeWidth(d) + "px" });

      var subChild = drawSubChildren(children);
      subChild.g.append("text").call(text).attr("class", "child3 no-click");

      addChildRectProperties(subChild.rect, className);
    }

    //common rect properties
    function addChildRectProperties(rect, className)
    {
      rect.attr("pointer-events", "visible")
      .attr("style", function(d){ return "opacity:0.25;stroke-width:" + calcRectStrokeWidth(d) + "px" });
      rect.on("click", transition);

      rect.append("title")
      .text(function(d) { return getKey(d) + ": " + scope.formatNumber(d); });
    }

    function text(text) {
      text.append("tspan").attr("class", "key" );
      text.append("tspan").attr("class", "val" );

      textPos(text);
    }

    function textPos(text, isTransition) {
      text.each(function(){
        var rectWidth = d3.select(this.parentNode).select("rect").attr("width");
        var rectHeight = d3.select(this.parentNode).select("rect").attr("height");

        d3.select(this).select("tspan.key").attr("class", function(){
          if(rectHeight < 40)
          {
            return "hidden";
          }

          return (rectHeight < 80 || rectWidth < 100) ? "key sm-key" : "key";
        });

        d3.select(this).select("tspan.val").attr("class", function(){
          if(rectHeight < 40)
          {
            return "hidden";
          }

          return (rectHeight < 80 || rectWidth < 100) ? "val treeValue sm-Val" : "val treeValue";
        });
      });

      //Unsure how robust this is.
      text
      .attr("x", function (d) { return (!isTransition) ? d.x0 + 16 : x(d.x0) + 16; })
      .attr("y", function (d) { return (!isTransition) ? d.y0 + 16 : y(d.y0) + 16; });

      text.selectAll("tspan.key")
      .attr("x", function (d) { return (!isTransition) ? d.x0 + 8 : x(d.x0) + 8; })
      .attr("textSize", function(){
        return d3.select(this.parentNode.parentNode).select("rect").attr("width");
      })
      .text(function (d) { return getKey(d); }).each(wrap);

      text.selectAll("tspan.val")
      .attr("dy", "1.3em")
      .attr("x", function (d) { return (!isTransition) ? d.x0 + 8 : x(d.x0) + 8; })
      .text(function (d) { return scope.formatNumber(d); });
    }

    //http://stackoverflow.com/questions/9241315/trimming-text-to-a-given-pixel-width-in-svg
    function wrap() {
      var self = d3.select(this);
      if(!document.body.contains(self.node())) return;    //IE fix (catch invisible dom items flagging null error)

      var textLength = self.node().getComputedTextLength(),
          text = self.text();

      while ((textLength + 15 > +self.attr('textSize')) && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + '...');
        textLength = self.node().getComputedTextLength();
      }
    }

    function rect(rect, isTransition) {
      //Unsure how robust this is.
      rect
      .attr("x", function (d) { return (!isTransition) ? d.x0 : x(d.x0); })
      .attr("y", function (d) { return (!isTransition) ? d.y0 : y(d.y0); })
      .attr("width", function (d) { return (!isTransition) ? d.x1 - d.x0 : x(d.x1) - x(d.x0); })
      .attr("height", function (d) { return (!isTransition) ? d.y1 - d.y0 : y(d.y1) - y(d.y0); });
    }

    //find some usable key out of the treemap data.
    //this has been extended to deal with treemaps that have been called from a sunburst (which needs null'd lower leaf data.
    function getKey(d)
    {
      if(!d || !d.data) {
        return "";
      }

      //Use case: ???
      if(d.data.type) {
        return d.data.type;
      }

      //Use case: regular hierachy formed data.
      if(d.data.key) {
        if(d.data.key === "null" && d.parent)
        {
          return getKey(d.parent);  //try and reach up the chain and find a parent key
        }

        return d.data.key;
      }

      //Use case: ???
      if(d.data.data && d.data.data.name) {
        return d.data.data.name;
      }

      else {
        return "";
      }
    }

    function name(d) {
      var key = getKey(d);

      if(key === "root") {
        key = "Report";
      }

      return (!d || !d.parent ? key : name(d.parent) + key) + " / " ;
    }

    function changeLevel()
    {
      var g = scope.svg.select("g.depth").selectAll("g.cell");
      var parents = g.selectAll("rect.parent");

      addChildren(g, scope.g, parents);

      if(annotations) {
        annotations.updateAnnotations(level, g);
      }
    }

    function render(scope, data, element) {
      if(!data) { return null ;}

      var width = scope.width;
      var height = scope.height;

      x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);

      y = d3.scaleLinear()
      .domain([0, height])
      .range([0, height]);

      treemap = d3.treemap()
      .size([width, height])
      .padding(1)
      .round(true);

      if(data) {
        currentData = data;
      }

      SliderService.createSlider(scope, containerRoot, setLevel, level);

      scope.g.attr("display", "block");
      container.classed("table-on", false);

      treemap(currentData);
      var g = display(currentData);

      if(annotations) {
        annotations.updateAnnotations(level, g);
      }
    }

    function resize(scope, element) {
      width = scope.width;
      height = scope.height;

      update(width, height, scope.annotationsEnabled, scope.isZoomIn);

      if(annotations) {
        annotations.updateAnnotations(level, scope.svg);
      }
    }

    function update(width, height, annotationsEnabled, isZoomIn)
    {
      if(isZoomIn) {
        height = height - footerOffset;
      }

      if(height < 0) {
        height = 100;
      }

      x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);

      y = d3.scaleLinear()
      .domain([0, height])
      .range([0, height]);

      treemap = d3.treemap()
      .size([width, height]);

      if(currentData)
      {
        currentData = treemap(currentData);

        x.domain([currentData.x0, currentData.x1]);
        y.domain([currentData.y0, currentData.y1]);
      }

      var g = scope.g.selectAll("g.depth")
      .selectAll("g.cell");

      /* TODO there are probably better ways of doing this, but calling zoom when
         with the axis conversion was not working.
      */
      g.select("rect").call(rect, (annotationsEnabled)? !annotationsEnabled : true);
      g.selectAll("text").call(textPos, (annotationsEnabled)? !annotationsEnabled : true);

      container.select(".tree-breadcrumb").text(name(currentData).substr(0, name(currentData).length - 3));    //TODO substr is a bit hack, form this up better
      SliderService.updateSlider(level, containerRoot);
    }

    return {
      type: "treemap",
      destroy: destroy,

      init: init,
      render: render,
      resize: resize,

      display: display,
      setLevel: setLevel,
      getLevel: getLevel,
      changeLevel: changeLevel
    };
  }]);
