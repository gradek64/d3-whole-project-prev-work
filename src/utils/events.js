/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('utils.events', [])
  .factory('events', () => {
    const events = {};

    const on = function(id, callback) {
      // console.log(events.CLICK_ON_CREATE_COST_MODEL);
      if (!callback || typeof callback !== 'function') {
        console.warn(
          'You must pass a function as the second argument to events.on()'
        );
      }

      if (events[id] === undefined) {
        events[id] = [];
      }
      events[id].push(callback);
    };

    const off = function(id, callback) {
      if (events[id]) {
        for (let i = 0; i < events[id].length; i++) {
          if (events[id][i] === callback) {
            events[id].splice(i, 1);
            break;
          }
        }
      }
    };

    const emit = function(id, payload) {
      if (events[id] && events[id].length) {
        events[id].forEach((callback) => callback(payload));
      }
    };

    return {on, off, emit};
  })
  .factory('emitFactory', [
    'events',
    (events) => {
      return (event) => (payload) => events.emit(event, payload);
    },
  ]);
