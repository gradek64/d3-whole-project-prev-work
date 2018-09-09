/**
 * Created by joshrayman on 08/02/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('SliderService', function() {

  //Tree detail level slider
  function createSlider(scope, containerRoot, setLevel, level)
  {
    var levels = scope.chartInfo.detailLabels;
    var slider = containerRoot.select(".lvl");

    if(levels) {
      slider.selectAll("div.btn")
      .data(levels)
      .exit().remove();

      slider.selectAll("div.btn")
      .data(levels)
      .enter()
      .append("div")
      .on("click", function(d, i){
        setLevel(i + 1);
        updateSlider(i + 1, containerRoot);
      })
      .attr("class", "btn");

      updateSlider(level, containerRoot);
    }
  }

  function updateSlider(level, containerRoot, depth) {
    if(depth > 0) {
      // is sunburst, and below parent.
      containerRoot.select(".lvl").classed("hide", true);
    } else {
      containerRoot.select(".lvl").classed("hide", false);

      var slider = containerRoot.select(".lvl").selectAll("div.btn");

      slider
      .attr("class", function(d, i){
        return (i + 1 === level) ? "btn btn-primary" : "btn btn-default";
      })
      .text(function(d) { return d; });
    }
  }

  function deleteSlides(containerRoot) {
    containerRoot.select('.lvl').selectAll('div').remove();
  }

  return {
    createSlider: createSlider,
    updateSlider: updateSlider,
    deleteSlides: deleteSlides,
  }
});
