/**
 * Created by Sergiu Ghenciu on 21/12/2017
 */

'use strict';

angular.module('utils.cookies', ['utils.misc']).factory('cookies', [
  'misc',
  (_) => {
    let withDotDomain;

    const set = (sKey, sValue, vEnd, sPath, sDomain, bSecure) => {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
        return false;
      }
      let sExpires = '';
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires =
              vEnd === Infinity
                ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
                : '; max-age=' + vEnd;
            break;
          case String:
            sExpires = '; expires=' + vEnd;
            break;
          case Date:
            sExpires = '; expires=' + vEnd.toUTCString();
            break;
        }
      }
      document.cookie =
        encodeURIComponent(sKey) +
        '=' +
        encodeURIComponent(sValue) +
        sExpires +
        (sDomain ? '; domain=' + sDomain : '') +
        (sPath ? '; path=' + sPath : '') +
        (bSecure ? '; secure' : '');
      return true;
    };

    const get = (sKey) => {
      if (!sKey) {
        return null;
      }
      return (
        decodeURIComponent(
          document.cookie.replace(
            new RegExp(
              '(?:(?:^|.*;)\\s*' +
                encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') +
                '\\s*\\=\\s*([^;]*).*$)|^.*$'
            ),
            '$1'
          )
        ) || null
      );
    };

    const remove = (sKey, sPath, sDomain) => {
      document.cookie =
        encodeURIComponent(sKey) +
        '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
        (sDomain ? '; domain=' + sDomain : '') +
        (sPath ? '; path=' + sPath : '');
      return true;
    };

    const computeDomain = () => {
      if (withDotDomain) return withDotDomain;
      let domainParts = window.location.host.split('.');

      if (domainParts.length === 1) {
        withDotDomain = window.location.host; // localhost
      } else {
        remove('dot6180rm');
        const val = _.randomStr(9);

        withDotDomain = '.' + domainParts.pop(); // .com
        do {
          withDotDomain = '.' + domainParts.pop() + withDotDomain; // .foo.com
          document.cookie =
            'dot6180rm=' + val + '; path=/; domain=' + withDotDomain;
        } while (get('dot6180rm') !== val && domainParts.length);
      }
      return withDotDomain;
    };

    const setWithDot = (sKey, sValue, vEnd) =>
      set(sKey, sValue, vEnd, '/', computeDomain());

    const removeWithDot = (sKey) => remove(sKey, '/', computeDomain());

    return {
      set,
      get,
      remove,
      computeDomain,
      setWithDot,
      removeWithDot,
    };
  },
]);
