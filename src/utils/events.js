/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular.module('utils.events', []).factory('events', () => {
  const events = {};
  console.log('events called');
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
      console.log(
        'PLACE THAT EVENT IS DISPATCHED AND CALLBACK FUNCTION CALLED',
        events[id]
      );
      events[id].forEach((callback) => callback(payload));
    }
  };

  return {on, off, emit};
});
// NOT BEING USED;
/* .factory('emitFactory', [
    'events',
    (events) => {
      return (event) => (payload) => events.emit(event, payload);
    },
  ]);*/
