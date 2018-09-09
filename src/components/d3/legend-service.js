/**
 * Created by Sergiu Ghenciu on 05/03/2018
 *
 * Expected data structure: [{label:'A'}, {label:'B'}, ...]
 */

'use strict';

angular
  .module('components.d3.legend-service', ['utils.misc'])
  .service('legendService', [
    'misc',
    function(_) {
      const bar = (el, data, opts) => {
        return el.querySelectorAll('.axis.x .tick');
      };

      const pie = (el, data, opts) => {
        const color = _.scaleOrdinal(opts.colors);

        const prefix = 'items-count-';
        _.removeClassByPrefix(el, prefix);
        if (data.length) {
          el.classList.add(prefix + data.length);
        }

        const els = [];
        data.forEach((e, i) => {
          const item = document.createElement('span');
          const square = document.createElement('span');
          square.style.backgroundColor = color(i);

          item.append(square);
          item.append(document.createTextNode(e.label));
          el.append(item);

          els.push(item);
        });

        return els;
      };
      const render = (el, data, opts) => {
        if (opts.type === 'bar') {
          return bar(el, data, opts);
        }
        return pie(el, data, opts);
      };

      return {
        render,
      };
    },
  ]);
