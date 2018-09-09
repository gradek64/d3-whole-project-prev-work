/**
 * Created by Sergiu Ghenciu on 09/05/2018
 */

'use strict';

/* eslint-disable */
angular
  .module('services.auth-service', [
    'utils.misc',
    'utils.cookies',
    'services.roles-service'
  ])
  .factory('authService', [
    'misc',
    'cookies',
    'rolesService',
    '$q',
    (_, cookies, rolesService, $q) => {
      const users = [
        {
          password: 'dipper',
          username: 'sergiu@amalytics.co'
        },
        {
          password: 'dipper',
          username: 'joy@amalytics.co'
        },
        {
          password: 'dipper',
          username: 'rc1@amalytics.co'
        }
      ];

      const success = {
        access_token: 'dc249c33',
        token_type: 'bearer',
        refresh_token: '39737a62',
        expires_in: 2147483646,
        scope: 'read'
      };

      const setToken = data => {
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

      const login = credentials =>
        $q((resolve, reject) => {
          console.log('credentials', credentials);
          if (
            !users.find(
              e =>
                e.username === credentials.username &&
                e.password === credentials.password
            )
          ) {
            return reject({
              data: {
                statusCode: 401,
                message: 'NOT_AUTHORISED',
                description: 'Not Authorised'
              }
            });
          }

          setToken(success);
          rolesService.getAll('current').then(roles => {
            setUser(success, credentials, roles.data);
            resolve(success);
          });
        });

      const logout = () =>
        $q(resolve => {
          clearCookies();
          resolve();
        });

      const isAuthenticated = () => !!cookies.get('username');

      const isAuthorised = roles =>
        isAuthenticated() &&
        (roles.indexOf('*') !== -1 ||
          getRoles().some(e => roles.indexOf(e) !== -1));

      const getUser = () => {
        if (!isAuthenticated()) {
          return null;
        }
        return {
          username: cookies.get('username'),
          roles: getRoles()
        };
      };

      return {
        login,
        logout,
        isAuthenticated,
        isAuthorised,
        getUser
      };
    }
  ]);
