/**
 * Created by Sergiu Ghenciu on 26/03/2018
 */

'use strict';
/* eslint-disable */
angular.module('app').factory('mapLocationService', function() {
  const getLocation = locationName => {
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      let req = new XMLHttpRequest();
      const mapServiceKey = 'xAIY2nNla7WMbgaxgfM4FPRPfGnKGfya';
      req.open(
        'GET',
        `http://open.mapquestapi.com/geocoding/v1/address?key=${mapServiceKey}&location=${locationName}`
      );

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(JSON.parse(req.response));
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error('Network Error'));
      };

      // Make the request
      req.send();
    });
  };

  return {
    getLocation
  };
});
