/**
 * Created by Sergiu Ghenciu on 22/12/2017
 */

'use strict';

angular
  .module('services.api-service', [
    'utils.http',
    'utils.env',
    'utils.cookies',
    'utils.events',
  ])
  .factory('apiService', [
    'http',
    'ENV',
    'cookies',
    'events',
    (http, ENV, cookies, events) => {
      const TIMEOUT = 30000;

      const errorInterceptor = (err) => {
        switch (err.status) {
          case -1:
            if (err.xhrStatus === 'abort') {
              if (!err.config) {
                err.config = {timeout: TIMEOUT};
              }
              console.warn(
                `REQUEST CANCELED (config timeout: ${err.config.timeout}ms)`
              );
            }
            break;
          case 401:
          case 405:
            events.emit('NOT_AUTHENTICATED');
            break;
          case 403:
            events.emit('NOT_AUTHORISED');
          // break;
          // case 405:
          //   events.emit('METHOD_NOT_ALLOWED');
        }

        // console.log(err)
        // console.log(err instanceof Error)
        // console.log(typeof err)
        // console.log(err.constructor.name)
        throw err;
      };

      const responseMiddleware = (res) => {
        return res;
      };

      const requestInterceptor = (config) => {
        const conf = Object.assign({timeout: TIMEOUT}, config);
        conf.url = ENV.BASE_URL + config.path;
        conf.path = null;

        if (conf.headers === undefined) {
          conf.headers = {};
        }
        conf.headers.Authorization = cookies.get('access_token');
        return conf;
      };

      const send = (config) => {
        return http
          .send(requestInterceptor(config))
          .then(responseMiddleware)
          .catch(errorInterceptor);
      };

      const get = (path, config) =>
        send(Object.assign({}, config, {method: 'GET', path: path}));

      const post = (path, data, config) =>
        send(
          Object.assign({}, config, {method: 'POST', path: path, data: data})
        );

      const put = (path, data, config) =>
        send(
          Object.assign({}, config, {method: 'PUT', path: path, data: data})
        );

      const patch = (path, data, config) =>
        send(
          Object.assign({}, config, {method: 'PATCH', path: path, data: data})
        );

      const del = (path, config) =>
        send(Object.assign({}, config, {method: 'DELETE', path: path}));

      return {
        send,
        get,
        post,
        put,
        patch,
        delete: del,
      };
    },
  ]);
