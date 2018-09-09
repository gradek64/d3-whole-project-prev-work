'use strict';

describe('components.version module', function() {
  beforeEach(module('components.version'));

  describe('version service', function() {
    it(
      'should return current version',
      inject(function(version) {
        expect(version).toEqual('0.3.0');
      })
    );
  });
});
