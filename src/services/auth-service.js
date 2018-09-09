/**
 * Created by Sergiu Ghenciu on 20/12/2017
 */

'use strict';

angular
  .module('services.auth-service', [
    'utils.http',
    'utils.env',
    'utils.cookies',
    'services.roles-service',
  ])
  .factory('authService', [
    'http',
    'ENV',
    'cookies',
    'rolesService',
    (http, ENV, cookies, rolesService) => {
      const setToken = (data) => {
        // should data.expires_in be seconds
        const expires = parseInt(data.expires_in, 10);

        cookies.set('access_token', data.access_token, expires);
        cookies.set('refresh_token', data.refresh_token, expires);
        cookies.set('token_type', data.token_type, expires);
        cookies.set('scope', data.scope, expires);
      };

      const setUser = (token, user, roles) => {
        // should data.expires_in be seconds
        const expires = parseInt(token.expires_in, 10);
        cookies.set('username', user.username, expires);
        if (roles) {
          cookies.set('roles', JSON.stringify(roles), expires);
        }
      };

      const clearCookies = () => {
        cookies.remove('access_token');
        cookies.remove('refresh_token');
        cookies.remove('token_type');
        cookies.remove('scope');
        cookies.remove('username');
        cookies.remove('roles');
      };

      const getRoles = () => JSON.parse(cookies.get('roles'));
      const mock = true;
      const login = (credentials) => {
        console.warn('check from where is ENV.BASE_URL');
        console.log('ENV.BASE_URL', ENV.BASE_URL);

        if (!mock) {
          return http
            .send({
              method: 'POST',
              url: `${ENV.BASE_URL}/auth/login`,
              data: credentials,
            })
            .then((res) => {
              console.log('token data from response', res.data);
              setToken(res.data);

              console.log('res login', res);

              return res.data;
            })
            .then((token) => {
              return rolesService
                .getAll('current')
                .then((roles) => {
                  console.log('ROLES', roles);
                  setUser(token, credentials, roles.data);
                  return;
                })
                .then(() => token);
            });
        } else {
          return new Promise((resolve, reject) => {
            const token = {
              access_token: 'cd3be371-57b5-4d49-b96e-80c6cfc4137f',
              token_type: 'bearer',
              refresh_token: 'e6cf33ac-0498-413d-8b6f-70fc9166b7e8',
              expires_in: 2147483646,
              scope: 'read',
            };
            setToken(token);
            resolve(token);
          }).then((token) => {
            console.log('token mock', mock);

            return new Promise((resolve, reject) => {
              const rolesUser = {data: ['SEE', 'admin']};
              resolve(rolesUser);
              setUser(token, credentials, rolesUser.data);
            });
          });
        }
      };

      const logout = () => {
        if (!mock) {
          return http
            .send({
              method: 'POST',
              url: `${ENV.BASE_URL}/auth/logout`,
              headers: {Authorization: cookies.get('access_token')},
            })
            .then((res) => {
              console.log('logout token', res);
              clearCookies();
              return res;
            });
        } else {
          // needs to be valid so value true will do a job!;
          return new Promise((resolve, reject) => {
            console.log('logout out successfull !');
            const logout = true;
            clearCookies();
            resolve(logout);
          });
        }
      };

      const isAuthenticated = () => !!cookies.get('username');

      const isAuthorised = (roles) =>
        isAuthenticated() &&
        (roles.indexOf('*') !== -1 ||
          getRoles().some((e) => roles.indexOf(e) !== -1));

      const getUser = () => {
        console.log('cookies.get(username)', cookies.get('username'));

        if (!isAuthenticated()) {
          return null;
        }
        return {
          username: cookies.get('username'),
          roles: getRoles(),
        };
      };

      return {
        login,
        logout,
        isAuthenticated,
        isAuthorised,
        getUser,
      };
    },
  ]);
