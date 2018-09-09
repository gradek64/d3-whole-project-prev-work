/**
 * Created by Sergiu Ghenciu on 02/03/2018
 */

'use strict';

angular.module('components.d3.tooltip-service', []).service('tooltipService', [
  function() {
    const relativeCords = (event, parent) => {
      const bounds = parent.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      return [x, y];
    };

    const showTooltip = (el, text, event) => {
      const tooltip = el.querySelector('.material-tooltip');

      tooltip.style.opacity = 1;

      const w = tooltip.clientWidth;
      const h = tooltip.clientHeight;

      const mousePos = relativeCords(event, el.querySelector('.canvas'));

      mousePos[1] -= h + 5;
      mousePos[0] -= w / 2;

      tooltip.style.top = mousePos[1] + 'px';
      tooltip.style.left = mousePos[0] + 'px';

      if (text) {
        tooltip.querySelector('span').innerText = text;
      }
    };

    const hideTooltip = (el) => {
      el.querySelector('.material-tooltip').style.left = '-9000px';
    };

    return {
      showTooltip,
      hideTooltip,
    };
  },
]);
