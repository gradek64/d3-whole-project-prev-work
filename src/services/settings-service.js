/**
 * Created by Sergiu Ghenciu on 27/02/2018
 */

'use strict';

angular.module('services.settings-service', []).service('settingsService', [
  function() {
    const primary = 'primary_output';
    const secondary = 'secondary_output';

    const set = (key, val) => {
      window.localStorage[key] = JSON.stringify(val);
      return val;
    };

    const get = (key) =>
      window.localStorage[key] ? JSON.parse(window.localStorage[key]) : null;

    return {
      set,
      get,
      setPrimaryOutput: (val) => set(primary, val),
      setSecondaryOutput: (val) => set(secondary, val),
      getPrimaryOutput: () => get(primary),
      getSecondaryOutput: () => get(secondary),
    };
  },
]);
