/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

describe('utils', () => {
  let misc;

  beforeEach(module('utils.misc'));
  beforeEach(
    inject((_misc_) => {
      misc = _misc_;
    })
  );

  describe('#flattenArr(arr)', () => {
    it('should flatten one-level array', () => {
      const input = [[1, 2], [3, 4]];
      const output = [1, 2, 3, 4];
      expect(misc.flatten(input)).toEqual(output);
    });
  });

  describe('#ucFirst(str)', () => {
    it('should capitalize the first letter', () => {
      expect(misc.ucFirst('ab')).toEqual('Ab');
    });
    it('should not touch the letters after the first', () => {
      expect(misc.ucFirst('aB')).toEqual('AB');
    });
  });

  describe('#union(arr)', () => {
    it('should return distinct elements', () => {
      expect(misc.uniq(['a', 'b', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('#intersection(arr1, arr2)', () => {
    it('should return the elements that exist in both arrays', () => {
      expect(misc.intersection(['a', 'b'], ['b', 'c'])).toEqual(['b']);
    });
  });

  describe('#difference(arr1, arr2)', () => {
    // eslint-disable-next-line
    it('should return the elements that exist in arr1 and not exist in arr2', () => {
      expect(misc.difference(['a', 'b'], ['b'])).toEqual(['a']);
    });
  });

  describe('#intersectionAll(arrOfArrs)', () => {
    it('should return the elements that exist in all the arrays', () => {
      expect(
        misc.intersectionAll([['a', 'b'], ['a', 'c'], ['a', 'd']])
      ).toEqual(['a']);
    });
  });

  describe('#rand(min, max)', () => {
    it('should return an integer between min and max inclusive', () => {
      const res = misc.rand(1, 9);
      expect(res).toEqual(jasmine.any(Number));
      expect(res % 1).toEqual(0);
      expect(res).toBeGreaterThan(0);
      expect(res).toBeLessThan(10);
    });
  });

  describe('#swap(arr, i, j)', () => {
    it('should swap two elements within the array', () => {
      expect(misc.swap([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    });
  });

  describe('#shuffle(arr)', () => {
    it('should shuffle the array', () => {
      expect(misc.shuffle([1, 2, 3, 4, 5])).not.toEqual([1, 2, 3, 4, 5]);
    });
  });
});
