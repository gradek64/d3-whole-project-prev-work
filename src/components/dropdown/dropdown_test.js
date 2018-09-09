'use strict';

describe('components.dropdown module', function() {
  beforeEach(module('components.dropdown'));

  describe('dropdown directive', function() {
    it('should render dropdown button', function() {
      inject(function($compile, $rootScope) {
        const element = $compile(
          `<a data-dropdown="{activates: 'x'}">test</a>`
        )($rootScope);
        expect(element[0]).not.toBe(null);
      });
    });
  });
});
