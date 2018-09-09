/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

/* eslint no-use-before-define: "error" */
/* eslint-disable prefer-spread, prefer-rest-params, guard-for-in, new-cap */

angular.module('utils.misc', []).factory('misc', function() {
  //
  // path
  // scan
  // insert
  //
  //   const nest = (data, keys = [], depth = 0) => {
  //     if (depth === keys.length) {
  //       return data;
  //     }
  //     return _.union(data.map(_.getProperty(keys[depth]))).map((k) => {
  //       return {
  //         label: k,
  //         children: nest(
  //             data.filter((e) => e[keys[depth]] === k),
  //             keys,
  //             depth + 1
  //         ),
  //       };
  //     });
  //   };

  /**
   * HOISTED
   */

  // const

  // Boolean (type)
  const def = (x) => typeof x !== 'undefined';
  const undef = (x) => !def(x);

  // Boolean (logical)

  // slice
  const slice = (from, to, arr) => {
    let r = [];
    let i = 0;
    while (from < to) {
      r[i] = arr[from];
      i += 1;
      from += 1;
    }
    return r;
  };

  // object functions

  // list functions
  const length = (x) => x.length;
  const findIndex = (pred, arr) => {
    let i = 0;
    while (i < length(arr)) {
      if (pred(arr[i])) {
        return i;
      }
      i += 1;
    }
    return -1;
  };
  const concat = (b, a) => {
    let i = 0;
    let r = [];

    while (i < length(a)) {
      r[i] = a[i];
      i += 1;
    }
    i = 0;
    while (i < length(b)) {
      r[length(r)] = b[i];
      i += 1;
    }
    return r;
  };
  const reduce = (fn, acc, arr) => {
    let i = 0;
    let l = length(arr);
    while (i < l) {
      acc = fn(acc, arr[i]);
      i += 1;
    }
    return acc;
  };
  const reduceRight = (fn, acc, arr) => {
    let i = length(arr);
    while (i > 0) {
      i -= 1;
      acc = fn(acc, arr[i]);
    }
    return acc;
  };
  // const map = (fn, arr) =>
  // reduce((a, e, i) => {a[i] = fn(e);return a;}, [], arr);
  const map = (fn, arr) => {
    let i = 0;
    let l = length(arr);
    let r = Array(l);
    while (i < l) {
      r[i] = fn(arr[i]);
      i += 1;
    }
    return r;
  };
  const equivalent = (a, b) => {
    if (length(a) !== length(b)) {
      return false;
    }
    let i = 0;
    while (i < length(a)) {
      if (a[i] !== b[i]) {
        return false;
      }
      i += 1;
    }
    return true;
  };

  // Math
  // (Ord a) => a -> a -> Ordering
  const compare = (a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  };

  /**
   * Composition
   */

  const apply = (fn, args) => fn.apply(null, args);
  const curry2 = (fn) =>
    function(a, b) {
      if (length(arguments) === 1) {
        return function(_b) {
          return fn(a, _b);
        };
      }
      return fn(a, b);
    };
  const curry3 = (fn) =>
    function(a, b, c) {
      switch (length(arguments)) {
        case 1:
          return curry2(function(_b, _c) {
            return fn(a, _b, _c);
          });
        case 2:
          return function(_c) {
            return fn(a, b, _c);
          };
      }
      return fn(a, b, c);
    };
  const curry = (fn, a = []) => (...b) => {
    let args = concat(b, a);
    if (length(args) < length(fn)) {
      return curry(fn, args);
    }
    return apply(fn, args);
  };
  const id = (x) => x;
  const noop = () => {};
  // (b -> b -> c) -> (a -> b) -> a -> a -> c
  const on = (f, g) => (a, b) => f(g(a), g(b));
  const flip = (fn) => (a, b) => fn(b, a);
  const o = (f, g) => (x) => f(g(x));
  const pipe = function() {
    const fns = arguments;
    return (init) => reduce((a, fn) => fn(a), init, fns);
  };
  const compose = function() {
    const fns = arguments;
    return (init) => reduceRight((a, fn) => fn(a), init, fns);
  };
  const partial = (fn, ...args) => (...newArgs) => fn(...args, ...newArgs);
  // converge(f, [g, h])(a, b) = f(g(a, b), h(a, b))
  const converge = (fn, ghs) =>
    function() {
      let args = arguments;
      return apply(fn, map((fn) => apply(fn, args), ghs));
    };
  // useWith(f, [g, h])(a, b) = f(g(a), h(b))
  const useWith = (fn, ghs) =>
    function() {
      let i = 0;
      let l = length(ghs);
      let args = Array(l);
      while (i < l) {
        args[i] = ghs[i](arguments[i]);
        i += 1;
      }
      return apply(fn, concat(slice(l, length(arguments), arguments), args));
    };
  const ifElse = (pred, onTrue, onFalse, x) =>
    pred(x) ? onTrue(x) : onFalse(x);
  const unless = (pred, onFalse, x) => (pred(x) ? x : onFalse(x));
  const when = (pred, onTrue, x) => (pred(x) ? onTrue(x) : x);
  const call = (fn) => fn();
  const once = (fn) => {
    let called = false;
    let r;
    return () => {
      if (called) {
        return r;
      }
      called = true;
      r = fn();
      return r;
    };
  };
  const debounce = (immediate, wait, func) => {
    let timeout;
    let r;

    const later = (args) => () => {
      timeout = null;
      r = apply(func, args);
    };

    return function() {
      let args = arguments;
      if (timeout) {
        clearTimeout(timeout);
      }
      if (immediate) {
        let callNow = !timeout;
        timeout = setTimeout(later(args), wait);
        if (callNow) {
          r = apply(func, args);
        }
      } else {
        timeout = setTimeout(later(args), wait);
      }

      return r;
    };
  };

  /**
   * const
   */

  const always = (val) => () => val;
  // const F = always(false);
  // const T = always(true);

  /**
   * Boolean (type)
   */

  const isNil = (x) => undef(x) || x === null;
  const isArray = (x) => Array.isArray(x);
  const isDate = (x) => Object.prototype.toString.call(x) === '[object Date]';
  const isString = (x) => typeof x === 'string';
  const isNumber = (x) => typeof x === 'number';
  const isFunction = (x) => typeof x === 'function';
  // prettier-ignore
  const isObject = (x) =>
      Object.prototype.toString.call(x) === '[object Object]';

  /**
   * Boolean (logical)
   */

  // (isNil(val) || val !== val) means -> is not `null`, `undefined` or `NaN`;
  const defaultTo = (x, val) => (isNil(val) || val !== val ? x : val);
  const identical = (a, b) => a === b;
  const not = (x) => !x;
  const and = (a, b) => a && b;
  const or = (a, b) => a || b;
  const gt = (b, a) => a > b; // greaterThan2 = gt(2); greaterThan2(3) -> tru
  const gte = (b, a) => a >= b;
  const lt = (b, a) => a < b;
  const lte = (b, a) => a <= b;
  const complement = (pred, x) => !pred(x);
  const both = (pred1, pred2, x) => pred1(x) && pred2(x);
  const either = (pred1, pred2, x) => pred1(x) || pred2(x);
  const any = (pred, arr) => {
    let i = 0;
    while (i < length(arr)) {
      if (pred(arr[i])) {
        return true;
      }
      i += 1;
    }
    return false;
  };
  const all = (pred, arr) => arr.every(pred);
  const none = (pred, arr) => !any(pred, arr);
  const includes = (x, arr) => any((e) => e === x, arr);

  /**
   * slice
   */

  const copy = (arr) => slice(0, length(arr), arr);
  const nth = (n, arr) => arr[n];
  const head = (arr) => arr[0];
  const last = (arr) => arr[length(arr) - 1];
  const init = (arr) => slice(0, length(arr) - 1, arr);
  const tail = (arr) => slice(1, length(arr), arr);
  const take = (n, arr) => slice(0, n > length(arr) ? length(arr) : n, arr);
  const drop = (n, arr) => slice(n < 0 ? 0 : n, length(arr), arr);

  /**
   * string
   */

  const trim = (s) => str.trim();
  const replace = (a, b, s) => s.replace(a, b);
  const split = (separator, s) => s.split(separator);
  const test = (regexp, s) => regexp.test(s);
  const match = (regexp, s) => s.match(regexp);
  const toString = String;
  const toUpper = (s) => s.toUpperCase();
  const toLower = (s) => s.toLowerCase();
  const concatStr = (b, a) => a + b;
  // capitalize('BOB'); => 'Bob'
  // ucFirst('bob'); => 'Bob'

  /**
   * object functions
   */

  // Create a (shallow-cloned) duplicate of an object.
  const clone = (obj) => {
    let r = {};
    for (let p in obj) {
      r[p] = obj[p];
    }
    return r;
  };
  const keys = (obj) => {
    let i = 0;
    let r = [];
    for (let p in obj) {
      r[i] = p;
      i += 1;
    }
    return r;
  };
  const values = (obj) => Object.values(obj);
  const prop = (prop, obj) => obj[prop];
  const merge = (b, a) => Object.assign({}, a, b);
  const has = (prop, obj) => obj.hasOwnProperty(prop);
  const mergeWithKey = (fn, b, a) => {
    let r = {};
    let k;

    for (k in a) {
      if (has(k, a)) {
        r[k] = has(k, b) ? fn(k, a[k], b[k]) : a[k];
      }
    }

    for (k in b) {
      if (has(k, b) && !has(k, r)) {
        r[k] = b[k];
      }
    }

    return r;
  };
  const mergeDeepWithKey = (fn, b, a) =>
    mergeWithKey(
      (k, aVal, bVal) => {
        if (isObject(aVal) && isObject(bVal)) {
          return mergeDeepWithKey(fn, aVal, bVal);
        } else {
          return fn(k, aVal, bVal);
        }
      },
      a,
      b
    );

  const mergeDeep = (b, a) => mergeDeepWithKey((k, aVal) => aVal, b, a);
  // const mergeDeepWith = (fn, a, b) =>
  //     mergeDeepWithKey((k, aVal, bVal) => fn(aVal, bVal), a, b);
  const assoc = (prop, val, obj) => {
    let r = clone(obj);
    r[prop] = val;
    return r;
  };
  const dissoc = (prop, obj) => {
    let r = {};
    for (let p in obj) {
      if (prop !== p) {
        r[p] = obj[p];
      }
    }
    return r;
  };
  const omit = (props, obj) => reduce(flip(dissoc), obj, props);
  const pick = (props, obj) => {
    let r = {};
    let i = 0;
    while (i < length(props)) {
      r[props[i]] = obj[props[i]];
      i += 1;
    }
    return r;
  };

  /**
   * list functions
   */
  // transpose([[1, 'a'], [2, 'b'], [3, 'c']]) => [[1, 2, 3], ['a', 'b', 'c']]
  // const transpose = (arr) => {
  //   let i = 0;
  //   let r = [];
  //   while (i < length(arr)) {
  //     let inner = arr[i];
  //     let j = 0;
  //     while (j < length(inner)) {
  //       if (undef(r[j])) {
  //         r[j] = [];
  //       }
  //       r[j].push(inner[j]);
  //       j += 1;
  //     }
  //     i += 1;
  //   }
  //   return r;
  // };
  const isEmpty = (x) => length(x) === 0;
  const pluck = (prop, arr) => map((e) => e[prop], arr);
  const of = (x) => [x];
  const find = (pred, arr) => arr[findIndex(pred, arr)];
  const indexOf = (x, arr) => findIndex((e) => e === x, arr);
  const times = (fn, n) => {
    let i = 0;
    let r = Array(n);
    while (i < n) {
      r[i] = fn(i);
      i += 1;
    }
    return r;
  };
  const filter = (pred, arr) => {
    let i = 0;
    let l = length(arr);
    let r = [];
    while (i < l) {
      if (pred(arr[i])) {
        r[length(r)] = arr[i];
      }
      i += 1;
    }
    return r;
  };
  const reject = (pred, arr) => filter((x) => !pred(x), arr);
  const reverse = (arr) => {
    let l = length(arr);
    let r = Array(l);
    let i = 0;
    while (l !== 0) {
      l -= 1;
      r[i] = arr[l];
      i += 1;
    }
    return r;
  };
  const append = (x, arr) => concat([x], arr);
  const prepend = (x, arr) => concat(arr, [x]);
  // const insert
  const join = (glue, arr) => arr.join(glue);
  const tap = (fn, x) => {
    fn(x);
    return x;
  };
  // one could argue which argument must go first
  const repeat = (n, val) => times(always(val), n);
  const flatten = (arr) => reduce(flip(concat), [], arr);
  const uniq = (arr) =>
    values(
      reduce(
        (a, e) => {
          a[e] = e;
          return a;
        },
        {},
        arr
      )
    );
  const intersection = (b, a) => filter((e) => includes(e, b), a);
  const difference = (b, a) => filter((e) => !includes(e, b), a);
  const union = (a, b) => uniq(concat(b, a));
  // const comparator = (pred, a, b) => (pred(a, b) ? -1 : pred(b, a) ? 1 : 0);
  // (Ord b) => (a -> b) -> a -> a -> Ordering
  const ascend = (fn) => (a, b) => compare(fn(a), fn(b));
  const descend = (fn) => (b, a) => compare(fn(a), fn(b));
  // const dynamicOrder = (fn, revers) => revers ? descend(fn) : ascend(fn);
  // sort :: Ord a => [a] -> [a]
  const sort = (arr) => copy(arr).sort(compare);
  // sortBy :: (a -> a -> Ordering) -> [a] -> [a]
  const sortBy = (fn, arr) => copy(arr).sort(fn);
  // sortOn :: Ord b => (a -> b) -> [a] -> [a]
  // const sortOn = (fn, arr) => sortBy(on(compare, fn), arr);
  const sortOn = (fn, arr) => sortBy(ascend(fn), arr);
  // [(a -> a -> Ordering)] -> [a] -> [a]
  const sortByAll = (fns, arr) =>
    sortBy((a, b) => {
      let r = 0;
      let i = 0;
      while (r === 0 && i < length(fns)) {
        r = fns[i](a, b);
        i += 1;
      }
      return r;
    }, arr);

  // zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
  const zipWith = (fn, b, a) => {
    if (or(isEmpty(a), isEmpty(b))) {
      return [];
    }
    return prepend(fn(head(a), head(b)), zipWith(fn, tail(a), tail(b)));
  };
  // _.zipWith(_.zipWith(_.multiply), [[1,1,1], [1,1,1]], [[2,3,4], [5,6,7]])

  // zip :: [a] -> [b] -> [(a,b)]
  // zip []     _bs    = []
  // zip _as    []     = []
  // zip (a:as) (b:bs) = (a,b) : zip as bs
  const zip = (b, a) => zipWith((y, x) => [x, y], a, b);

  // const inits = (a) => {
  //   if (isEmpty(a)) {
  //     return [[]];
  //   }
  //   return append(a, inits(init(a)));
  // };
  const inits = (arr) => {
    let r = [[]];
    let i = 1;
    while (i <= length(arr)) {
      r[i] = slice(0, i, arr);
      i += 1;
    }
    return r;
  };
  const tails = (arr) => {
    let r = [];
    let i = 0;
    let l = length(arr);
    while (i < l) {
      r[i] = slice(i, l, arr);
      i += 1;
    }
    r[i] = [];
    return r;
  };
  const isInfixOf = (b, a) => {
    let l = length(b);
    return any((x) => equivalent(take(l, x), b), tails(a));
  };
  const isPrefixOf = (b, a) => equivalent(b, take(length(b), a));
  const isSuffixOf = (b, a) => equivalent(b, drop(length(a) - length(b), a));
  // takeWhile :: (a -> Bool) -> [a] -> [a]
  const takeWhile = (pred, xs) => {
    let i = 0;
    let l = length(xs);
    while (i < l && pred(xs[i])) {
      i += 1;
    }
    return slice(0, i, xs);
  };
  // dropWhile :: (a -> Bool) -> [a] -> [a]
  const dropWhile = (pred, xs) => {
    let i = 0;
    let l = length(xs);
    while (i < l && pred(xs[i])) {
      i += 1;
    }
    return slice(i, l, xs);
  };
  // span :: (a -> Bool) -> [a] -> [[a], [a]]
  // const span = (pred, xs) => [takeWhile(pred, xs), dropWhile(pred, xs)];
  const span = (pred, xs) => {
    let i = 0;
    let l = length(xs);
    while (i < l && pred(xs[i])) {
      i += 1;
    }
    return [slice(0, i, xs), slice(i, l, xs)];
  };
  // partition :: (a -> Bool) -> [a] -> ([a], [a])
  // partition p xs == (filter p xs, filter (not . p) xs)
  const partition = (pred, xs) => [filter(pred, xs), filter(o(not, pred), xs)];

  // groupBy :: (a -> a -> Bool) -> [a] -> [[a]]
  // next are equivalent
  // groupBy( (x, y) => ((x > 0) && (y > 0)) || ((x <= 0) && (y <= 0)) ...
  // groupBy( (x, y) => ((x > 0) === (y > 0)) ...
  // groupBy( on(identical, gt(0)) ...
  const groupBy = (eq, xs) => {
    if (isEmpty(xs)) {
      return [];
    }

    // let [ys, zs] = span((x) => eq(head(xs), x), tail(xs));
    // return [[head(xs), ...ys], ...groupBy(eq, zs)];
    let s = span((b) => eq(b, head(xs)), tail(xs));
    return prepend(prepend(head(xs), s[0]), groupBy(eq, s[1]));
  };

  const each = (fn, xs) => {
    let i = 0;
    let l = length(xs);
    while (i < l) {
      fn(xs[i]);
      i += 1;
    }
    return xs;
  };

  /**
   * Math
   */

  const add = (a, b) => a + b;
  const subtract = (b, a) => a - b;
  const multiply = (a, b) => a * b;
  // dividend / divisor;
  const divide = (b, a) => a / b; // divideBy2 = divide(2); divideBy2(6) -> 3
  const negate = (x) => -x;
  const min = (a, b) => Math.min(a, b);
  const max = (a, b) => Math.max(a, b);
  const modulo = (b, a) => a % b;
  const sum = (arr) => reduce(add, 0, arr);
  const product = (arr) => reduce(multiply, 1, arr);
  const mean = (arr) => sum(arr) / length(arr);
  const percentage = (b, a) => b / a * 100; // percentage30 = percentage(30);
  // const random = (min, max) =>
  // Math.floor(coDomain(min, max+1)(Math.random()));
  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);
  const clamp = (min, max, x) => {
    if (min > max) {
      throw new Error('min must not be greater than max in clamp(min, max, x)');
    }
    return x < min ? min : x > max ? max : x;
  };
  const range = (from, to) => {
    let r = [];
    let i = 0;
    while (from < to) {
      r[i] = from;
      i += 1;
      from += 1;
    }
    return r;
  };

  /**
   * Monads
   */

  // object.of = pure
  // object.m = fmap
  // object.a = ap / <*>
  // object.b = bind / >>=
  /*
  function Identity(x) {
    this.value = x;
  }
  Identity.of = function(x) {
    return new Identity(x);
  };
  Identity.prototype.map = function(f) {
    return new Identity(f(this.value));
  };
  Identity.prototype.ap = function(functor) {
    return functor.map(this.value);
  };
  Identity.prototype.bind = function(f) {
    return f(this.value);
  };
  */

  function IdentityFactory() {
    function unit(x) {
      let monad = Object.create(null);
      monad.map = function(fn) {
        return unit(fn(x));
      };
      monad.ap = function(functor) {
        return functor.map(x);
      };
      monad.bind = function(fn) {
        return fn(x);
      };
      return monad;
    }
    unit.of = unit;
    return unit;
  }

  function NothingFactory() {
    function unit() {
      let monad = Object.create(null);
      monad.isNothing = true;
      monad.map = function() {
        return monad;
      };
      monad.ap = function() {
        return monad;
      };
      monad.bind = function() {
        return monad;
      };
      return monad;
    }
    unit.of = unit;
    return unit;
  }
  const Nothing = NothingFactory();

  function JustFactory() {
    let prototype = Object.create(null);
    function unit(x) {
      if (isNil(x) || x !== x) {
        return Nothing();
      }
      let monad = Object.create(prototype);
      monad.map = function(fn) {
        return unit(fn(x));
      };
      monad.ap = function(functor) {
        return functor.map(x);
      };
      monad.bind = function(fn) {
        return fn(x);
      };
      return monad;
    }
    unit.of = unit;
    return unit;
  }
  const Just = JustFactory();

  function MaybeFactory() {
    function unit(x) {
      return Just(x);
    }
    unit.of = unit;
    return unit;
  }
  const Maybe = MaybeFactory();
  // e.g.
  // url :: IO String
  // const url = new IO(() => window.location.href);
  // toPairs :: String -> [[String]]
  //   const toPairs = compose(fmap(split('=')), split('&'));
  // params :: String -> [[String]]
  //   const params = compose(toPairs, last, split('?'));
  // findParam :: String -> IO Maybe [String]
  //   const findParam = (key) => fmap(
  //       compose(Maybe.of, find((x) => head(x) === key), params),
  //       url
  //   );
  // -- Impure calling code ----------------------------------------------
  // findParam('searchTerm').unsafePerform();
  // Just([['searchTerm', 'wafflehouse']])
  function IOFactory() {
    let prototype = Object.create(null);
    function unit(unsafePerform) {
      if (!isFunction(unsafePerform)) {
        throw Error('IO requires a function');
      }
      let monad = Object.create(prototype);
      monad.unsafePerform = function() {
        return unsafePerform();
      };
      monad.map = function(fn) {
        return unit(compose(fn, unsafePerform));
      };
      monad.ap = function(functor) {
        return functor.map(unsafePerform());
      };
      monad.bind = function(fn) {
        return unit(function() {
          let next = fn(unsafePerform());
          return next.unsafePerform();
        });
      };
      return monad;
    }
    unit.of = function(x) {
      return unit(always(x));
    };
    return unit;
  }
  const IO = IOFactory();

  function LeftFactory() {
    function unit(x) {
      let monad = Object.create(null);
      monad.isLeft = true;
      monad.map = function(fn) {
        return monad;
      };
      monad.ap = function(functor) {
        return monad;
      };
      monad.bind = function(fn) {
        return fn(x);
      };
      return monad;
    }
    unit.of = unit;
    return unit;
  }

  const Right = IdentityFactory();
  const Left = LeftFactory();

  // The 'Either' type represents values with two possibilities: a value of
  // type @'Either' a b@ is either @'Left' a@ or @'Right' b@.
  function EitherFactory() {
    function unit(a, b) {
      if (isNumber(b) && b === b) {
        return Right(b);
      }
      return Left(a);
    }
    unit.of = unit;
    return unit;
  }
  // Either String Int
  const Either = EitherFactory();

  // -- parseEither = (x) => Either('parse error', parseFloat(x))
  // -- fancyError = (x) => `Error: ${x}`;
  // e.g. feither(fancyError, add(1), parseEither('4'))
  // either :: (a -> c) -> (b -> c) -> Either a b -> c
  const feither = (f, g, e) => (e.isLeft ? e.bind(f) : e.bind(g));

  // e.g. maybe(false, isOdd, Maybe(3)) -> true
  // -- parseMaybe = (x) => Maybe(parseFloat(x));
  // e.g. maybe(0, multiply(2), parseMaybe('5'))
  // maybe :: b -> (a -> b) -> Maybe a -> b
  const maybe = (v, f, m) => (m.isNothing ? v : m.bind(f));
  // const fdefaultTo = (v, m) => m.isNothing ? v : m.bind(id);

  /*
(<$>), which lifts a single-argument function into a Functor
(<*>), which chains a multi-argument function through an Applicative
(=<<), which binds a function that enters a Monad onto an existing computation
All three are, at heart, just regular function application, spiced up a little.
 */

  // one can reading fmap as "map a functor with"
  // <$> infix synonym for fmap
  // fmap / <$> :: (Functor f) => (a -> b) -> f a -> f b
  const fmap = (f, functor) => {
    if (isArray(functor)) {
      return map(f, functor);
    }

    if (isFunction(functor)) {
      return compose(f, functor);
    }
    return functor.map(f);
  };

  // function application in a functorial context
  /*
  Monad. Or Functor or Monoid or anything else that has a well-established term
  involving fewer than three adjectives. "Applicative"
   */
  /*
  (<*>) is just a modified function application, so you can either read it as
   "ap" or "apply",
   or elide it entirely the way you would normal function application.
  (<*>) also roughly generalizes zipWith on lists,
   so you can read it as "zip functors with",
   similarly to reading fmap as "map a functor with".
  */
  // (Applicative f)
  // (<*>) :: f (a -> b) -> f a -> f b
  // (*>)  :: f a -> f b -> f b
  // (<*)  :: f a -> f b -> f a
  // (<*>) :: Applicative f => f (a -> b) -> f a -> f b
  const ap = (applicative, functor) => {
    if (isArray(applicative) && isArray(functor)) {
      return reduce((a, x) => concat(map(x, functor), a), [], applicative);
    }
    return applicative.ap(functor);
  };

  // pure :: a -> f a
  // const pure = (x) => x.of(x);

  // -- | Lift a function to actions.
  // -- This function may be used as a value for `fmap` in a `Functor` instance.
  // liftA :: Applicative f => (a -> b) -> f a -> f b
  // liftA f a = pure f <*> a
  // -- Caution: since this may be used for `fmap`, we can't use the obvious
  // -- definition of liftA = fmap.
  // const liftA = (fn, fa) => pure(fmap(fn, fa));

  //   liftA2 (*) (Just 5) (Just 3)
  const liftA2 = (fn, fa, fb) => {
    // _.ap(_.fmap(_.multiply, Identity.of(5)), Identity.of(3))
    return ap(fmap(fn, fa), fb);
  };

  const liftA3 = (fn, fa, fb, fc) => {
    return ap(ap(fmap(fn, fa), fb), fc);
  };

  // ap :: (Monad m) => m (a -> b) -> m a -> m b

  // fn = function that returns a wrapped value
  // chain / (>>=) :: (Monad m) => m a -> (a -> m b) -> m b
  const chain = (fn, monad) => {
    if (isArray(monad)) {
      return flatten(map(fn, monad));
    }
    return monad.bind(fn);
  };

  // sequenceA :: (Applicative f) => [f a] -> f [a]
  const sequenceA = (as) => {
    if (isEmpty(as)) {
      // return pure []
      // return Identity.of([]);
      return [[]];
    }
    // eslint-disable-next-line
    return ap(fmap(x => xs => prepend(x, xs), head(as)), sequenceA(tail(as)));
  };

  /**
   * custom functions
   */

  const ifIsFunctionCallOrNoop = (x) => (isFunction(x) ? x() : noop);

  const collide = (b, a) => any((e) => includes(e, b), a);

  const intersectionAll = (arrOfArrs) =>
    reduce(flip(intersection), head(arrOfArrs), tail(arrOfArrs));

  const minAll = (arr) => reduce(min, Infinity, arr);

  const maxAll = (arr) => reduce(max, -Infinity, arr);

  const abs = (x) => Math.abs(x);

  const moveDecimal = (n, x) =>
    divide(Math.pow(10, Math.floor(Math.log10(x)) - n + 1), x);

  const swap = (arr, i, j) => {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    return arr;
  };

  const shuffle = (arr) => {
    let r = copy(arr);
    for (let i = 0; i < length(r); i++) {
      swap(r, i, random(i, length(r) - 1));
    }
    return r;
  };

  const randomStr = (length) => {
    let s = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      s += possible.charAt(random(0, possible.length - 1));
    }
    return s;
  };

  const compareFactory = (key, reverse, isNumber) => {
    const fn = isNumber ? compare : on(compare, toUpper);
    if (reverse) {
      return (b, a) => fn(a[key], b[key]);
    }
    return (a, b) => fn(a[key], b[key]);
  };

  const chunkRight = (arr, len) => {
    const chunks = [];
    let i = length(arr);

    while (i > len) {
      chunks.push(arr.slice((i -= len), i + len));
    }
    chunks.push(arr.slice(0, i));

    return chunks.reverse();
  };

  const formatNumber = (mod, c = 2, t = ',', d = '.') => {
    const parts = mod.toFixed(c).split('.');

    let str = chunkRight(String(parts[0]), 3).join(t);

    if (c > 0) {
      str += d + parts[1];
    }

    return str;
  };

  // input
  // (a, b)(x) takes a domain value x in [a,b] and
  // returns the corresponding value t in [0,1].
  const domain = (a, b) => {
    const c = b - a;
    return (x) => (x - a) / c;
  };

  // also called: codomain, image
  // or the output of the function is constrained to fall.
  // (a, b)(t) takes a value t in [0,1] and
  // returns the corresponding domain value x in [a,b].
  const coDomain = (a, b) => {
    const c = b - a;
    return (x) => x * c + a;
  };

  // scaleLinear = (x) => coDomain(0, 100)(domain(0, 1000)(x))

  const scaleOrdinal = (arr) => {
    const map = {};
    let i = 0;
    const max = length(arr) - 1;
    return (key) => {
      if (i > max) {
        i = 0;
      }
      if (undef(map[key])) {
        map[key] = i;
        i++;
      }
      return arr[map[key]];
    };
  };

  const ucFirst = (str) => join('', prepend(toUpper(head(str)), tail(str)));

  // prettier-ignore
  const removeClassByPrefix = (el, prefix) => {
    Array.from(el.classList)
    .filter((e) => e.indexOf(prefix) === 0)
    .forEach((e) => {
      el.classList.remove(e);
    });
    return el;
  };

  const download = (str, fileName) => {
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(str);
    a.download = fileName;
    a.click();
  };

  const copyObj = (o) => merge(o, {});

  const flattenDeep = (arr) =>
    reduce((a, b) => concat(ifElse(isArray, flattenDeep, of, b), a), [], arr);

  const mergeDeepAll = (arrOfObj) =>
    reduce(flip(mergeDeep), head(arrOfObj), tail(arrOfObj));

  const mergeDeepWithKeyAll = (fn, arrOfObj) =>
    reduce(
      (a, b) => mergeDeepWithKey(fn, b, a),
      head(arrOfObj),
      tail(arrOfObj)
    );

  const isNilOrEmpty = (x) => either(isNil, isEmpty, x);

  // const quickSort = (xs) => {
  //   if(length(xs) === 0) {
  //     return [];
  //   }
  //   let smaller = filter((a) => lte(head(xs), a), tail(xs));
  //   let bigger = filter((a) => gt(head(xs), a), tail(xs));
  //   return flatten([quickSort(smaller), [head(xs)], quickSort(bigger)]);
  // }

  return {
    always: always,
    // F: F,
    // T: T,

    def: def,
    undef: undef,
    isNil: isNil,
    isArray: isArray,
    isDate: isDate,
    isString: isString,
    isNumber: isNumber,
    isFunction: isFunction,
    isObject: isObject,

    defaultTo: curry2(defaultTo),
    identical: curry2(identical),
    not: not,
    and: curry2(and),
    or: curry2(or),
    gt: curry2(gt),
    gte: curry2(gte),
    lt: curry2(lt),
    lte: curry2(lte),
    complement: complement,
    both: curry3(both),
    either: curry3(either),
    any: curry2(any),
    all: curry2(all),
    none: curry2(none),
    includes: curry2(includes),

    length: length,
    slice: curry3((from, to, arr) =>
      slice(from < 0 ? 0 : from, to > length(arr) ? length(arr) : to, arr)
    ),
    nth: curry2(nth),
    copy: copy,
    head: head,
    tail: tail,
    last: last,
    init: init,
    take: curry2(take),
    drop: curry2(drop),

    trim: trim,
    replace: curry3(replace),
    split: curry2(split),
    test: curry2(test),
    match: curry2(match),
    toString: toString,
    toUpper: toUpper,
    toLower: toLower,
    concatStr: curry2(concatStr),

    keys: keys,
    values: values,
    prop: curry2(prop),
    merge: curry2(merge),
    omit: curry2(omit),
    pick: curry2(pick),
    assoc: curry3(assoc),
    dissoc: curry2(dissoc),

    isEmpty: isEmpty,
    pluck: curry2(pluck),
    reduce: curry3(reduce),
    reduceRight: curry3(reduceRight),
    map: curry2(map),
    times: curry2(times),
    find: curry2(find),
    findIndex: curry2(findIndex),
    indexOf: curry2(indexOf),
    filter: curry2(filter),
    reject: curry2(reject),
    reverse: reverse,
    concat: curry2(concat),
    append: curry2(append),
    prepend: curry2(prepend),
    join: curry2(join),
    tap: curry2(tap),
    repeat: curry2(repeat),
    flatten: flatten,
    uniq: uniq,
    intersection: curry2(intersection),
    difference: curry2(difference),
    union: curry2(union),
    // comparator: comparator,
    ascend: ascend,
    descend: descend,
    sort: sort,
    sortBy: curry2(sortBy),
    sortOn: curry2(sortOn),
    sortByAll: curry2(sortByAll),
    zipWith: curry3(zipWith),
    zip: curry2(zip),
    inits: inits,
    tails: tails,
    isInfixOf: curry2(isInfixOf),
    isPrefixOf: curry2(isPrefixOf),
    isSuffixOf: curry2(isSuffixOf),
    takeWhile: curry2(takeWhile),
    dropWhile: curry2(dropWhile),
    span: curry2(span),
    partition: curry2(partition),
    groupBy: curry2(groupBy),
    each: curry2(each),

    add: curry2(add),
    subtract: curry2(subtract),
    multiply: curry2(multiply),
    divide: curry2(divide),
    negate: negate,
    min: curry2(min),
    max: curry2(max),
    modulo: curry2(modulo),
    sum: sum,
    product: product,
    mean: mean,
    percentage: curry2(percentage),
    random: curry2(random),
    clamp: curry3(clamp),
    range: curry2(range),
    compare: curry2(compare),

    curry: curry,
    curry2: curry2,
    curry3: curry3,
    apply: curry2(apply),
    noop: noop,
    on: on,
    id: id,
    partial: partial,
    pipe: pipe,
    compose: compose,
    converge: curry2(converge),
    useWith: curry2(useWith),
    flip: flip,
    ifElse: curry(ifElse),
    unless: curry3(unless),
    when: curry3(when),
    call: call,
    once: once,
    debounce: curry3(debounce),

    IO: IO,
    Maybe: Maybe,
    Just: Just,
    Nothing: Nothing,
    Either: Either,
    Left: Left,
    Right: Right,
    fmap: curry2(fmap),
    // fzipWith: curry2(fzipWith),
    ap: curry2(ap),
    chain: curry2(chain),
    sequenceA: sequenceA,
    liftA2: curry3(liftA2),
    liftA3: curry(liftA3),
    maybe: curry3(maybe),
    feither: curry3(feither),

    collide: curry2(collide),
    intersectionAll,
    minAll: minAll,
    maxAll: maxAll,
    abs: abs,
    randomStr,
    shuffle,
    compareFactory,
    formatNumber,
    scaleOrdinal,
    domain,
    coDomain,
    ucFirst,
    removeClassByPrefix,
    download,
    ifIsFunctionCallOrNoop: ifIsFunctionCallOrNoop,
    copyObj: copyObj,
    mergeDeep: curry2(mergeDeep),
    mergeDeepWithKey: curry3(mergeDeepWithKey),
    mergeDeepAll: mergeDeepAll,
    mergeDeepWithKeyAll: curry2(mergeDeepWithKeyAll),
    moveDecimal: curry2(moveDecimal),
    isNilOrEmpty: isNilOrEmpty,
    flattenDeep: flattenDeep,
  };
});
