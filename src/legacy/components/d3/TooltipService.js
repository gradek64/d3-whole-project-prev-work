/**
 * Created by joshrayman on 02/02/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('TooltipService', [
  'ChartDataFormat',
  function(ChartDataFormat) {
    function addToolTipSvg(g) {
      g.select('#svg-tooltip').remove();

      let toolTip = g
        .append('g')
        .attr('id', 'svg-tooltip')
        .classed('tooltip', true)
        .attr('transform', 'translate(' + 10000 + ',' + 10000 + ')');

      toolTip
        .append('rect')
        .attr('width', 130)
        .attr('height', 30)
        .attr('fill', '#000')
        .attr('opacity', 0.35);

      toolTip
        .append('text')
        .attr('dy', 20)
        .attr('dx', 10)
        .attr('fill', '#fff');
    }

    function getTooltipPosition(scope, position) {
      let x, y, anchor;

      switch (position) {
        case 'top':
          x = 10;
          y = 10;
          anchor = 'start';
          break;
        case 'middle':
          x = scope.width / 2;
          y = (scope.height - 15) / 2;
          anchor = 'middle';
          break;
      }

      return {
        x: x,
        y: y,
        anchor: anchor,
      };
    }

    function bindWaterfallToolTipEvents(ele, scope) {
      ele
        .on('mouseover', function(d) {
          let str = ChartDataFormat.formatWaterfallTooltipText(d);
          positionTooltip(scope, str);
        })
        .on('mouseout', function(d) {
          scope.svg
            .select('g#svg-tooltip')
            .attr('transform', 'translate(' + 10000 + ',' + 10000 + ')');
        });
    }

    function bindToolTipEvents(ele, scope, isDate, total) {
      ele
        .on('mouseover', function(d) {
          let str = ChartDataFormat.formatTooltipText(d, isDate, total);
          positionTooltip(scope, str);
        })
        .on('mouseout', function(d) {
          scope.svg
            .select('g#svg-tooltip')
            .attr('transform', 'translate(' + 10000 + ',' + 10000 + ')');
        });
    }

    function positionTooltip(scope, str) {
      let pos = getTooltipPosition(scope, 'middle');

      let g = scope.svg
        .select('g#svg-tooltip')
        .attr('transform', 'translate(' + pos.x + ',' + pos.y + ')'); // change to , or margin top and pull it into the void.

      g
        .select('rect')
        .attr('width', str.length * 10)
        .attr('x', str.length * -10 / 2);

      g
        .select('text')
        .text(str)
        .attr('text-anchor', pos.anchor);
    }

    function getMousePosition(ele, width, height, offset) {
      let mousePos = d3.mouse(
        d3
          .select(ele[0])
          .select('.canvas')
          .node()
      );
      // var xOffset = -90;
      // var yOffset = (offset !== undefined) ? offset : -55;    // default for chord offset, override if specified

      // if(mousePos[0] < width / 2)
      // {
      //   mousePos[0] = mousePos[0] + xOffset;
      // }
      // else {
      //   mousePos[0] = mousePos[0] - xOffset;
      // }
      //
      // if(mousePos[1] < height / 2)
      // {
      //   mousePos[1] = mousePos[1] + yOffset;
      // }
      // else {
      //   mousePos[1] = mousePos[1] - yOffset;
      // }

      // mousePos[1] += yOffset;
      // mousePos[0] += xOffset;

      return mousePos;
    }

    function relativeCoords(event, parent) {
      let bounds = parent.getBoundingClientRect();
      let x = event.clientX - bounds.left;
      let y = event.clientY - bounds.top;
      return [x, y];
    }

    function showTooltip(element, text, event) {
      let tooltip = element[0].querySelector('.material-tooltip');

      tooltip.style.opacity = 1;

      let w = tooltip.clientWidth;
      let h = tooltip.clientHeight;

      let mousePos = event
        ? relativeCoords(event, element[0].querySelector('.canvas'))
        : getMousePosition(element);

      mousePos[1] -= h + 5;
      mousePos[0] -= w / 2;

      tooltip.style.top = mousePos[1] + 'px';
      tooltip.style.left = mousePos[0] + 'px';

      if (text) {
        tooltip.querySelector('span').innerText = text;
      }
    }

    function hideTooltip(element) {
      element[0].querySelector('.material-tooltip').style.left = '-9000px';
    }

    return {
      addToolTipSvg: addToolTipSvg,
      bindToolTipEvents: bindToolTipEvents,
      getMousePosition: getMousePosition,
      getTooltipPosition: getTooltipPosition,
      bindWaterfallToolTipEvents: bindWaterfallToolTipEvents,
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
    };
  },
]);
