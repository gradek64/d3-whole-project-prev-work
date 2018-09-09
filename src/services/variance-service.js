/**
 * Created by Sergiu Ghenciu on 05/06/2017.
 */

'use strict';

angular
  .module('services.variance-service', ['utils.misc'])
  .factory('varianceService', [
    'misc',
    function(_) {
      function computeUnionValues(arrayOfObjects, keyName) {
        let keys = [];

        arrayOfObjects
          .filter(function(object) {
            return object !== null;
          })
          .map(function(object) {
            let localKeys = object.map(function(item) {
              return item[keyName];
            });

            keys = keys.concat(localKeys);
          });

        return keys.filter(function(element, index, self) {
          return self.indexOf(element) === index;
        });
      }

      function computeVarianceCost(table) {
        return table.map(function(row) {
          row['costVariance'] = row['table2'] - row['table1'];
          return row;
        });
      }

      function groupByVarianceCosts(table, max, accessor) {
        if (table.length <= max) {
          return table;
        }

        let sortedMap = table
          .map(function(e, i) {
            return {value: e.costVariance, index: i};
          })
          .sort(function(a, b) {
            return Math.abs(b.value) - Math.abs(a.value);
          });

        // eslint-disable-next-line
        // var theBiggest = sortedMap.slice(0, max - 1).map(function (e) {return Object.assign({}, table[e.index]);}); // sorted
        let theBiggestIndexes = sortedMap.slice(0, max - 1).map(function(e) {
          return e.index;
        }); // raw
        let theBiggest = table.filter(function(e, i) {
          return theBiggestIndexes.includes(i);
        }); // raw

        let dynamicObject = {};
        dynamicObject[accessor.label] = 'Other(s)';
        dynamicObject.table1 = 0;
        dynamicObject.table2 = 0;
        dynamicObject.costVariance = 0; // ES5 dynamic object key
        let others = sortedMap.slice(max - 1).reduce(function(a, e) {
          a.table1 += table[e.index].table1;
          a.table2 += table[e.index].table2;
          a.costVariance += table[e.index].costVariance;
          return a;
        }, dynamicObject);

        if (others.table1 === 0) {
          others.table1 = null;
        }
        if (others.table2 === 0) {
          others.table2 = null;
        }
        if (others.costVariance === 0) {
          others.costVariance = null;
        }

        theBiggest.push(others);

        return theBiggest;
      }

      function computeVariancePercentage(table) {
        return table.map(function(row) {
          row['percentageVariance'] =
            row['table1'] === null || row['table2'] === null
              ? null
              : (row['table2'] - row['table1']) * 100 / row['table1'];
          return row;
        });
      }

      function computePercentageOutOfPrimary(varianceTable, total, accessor) {
        return varianceTable.map(function(e) {
          let row = {label: e[accessor.label]};
          row.id = e.id;
          row.value = e[accessor.value];
          row.percentage = e[accessor.value] / total * 100;
          return row;
        });
      }

      function mergeTables(table1, table2, accessor, preserve) {
        let skipList = [];

        let theFirstHalf = table1.map(function(o1) {
          let index = table2.findIndex(function(o2) {
            return o1[accessor.label] === o2[accessor.label];
          });

          let mo2 = null;

          if (index !== -1) {
            mo2 = table2[index][accessor.value];
            skipList.push(index);
          }

          let row = {};
          if (preserve && preserve.length) {
            preserve.forEach(function(k) {
              row[k] = o1[k];
            });
          }
          row[accessor.label] = o1[accessor.label];
          row['table1'] = o1[accessor.value];
          row['table2'] = mo2;

          return row;
        });

        let theSecondHalf = table2
          .filter(function(o2, index) {
            return !skipList.includes(index);
          })
          .map(function(o2) {
            let row = {};
            if (preserve && preserve.length) {
              preserve.forEach(function(k) {
                row[k] = o2[k];
              });
            }
            row[accessor.label] = o2[accessor.label];
            row['table1'] = null;
            row['table2'] = o2[accessor.value];

            return row;
          });

        return theFirstHalf.concat(theSecondHalf);
      }

      return {
        computeUnionValues: computeUnionValues,
        computeVarianceCost: computeVarianceCost,
        computeVariancePercentage: computeVariancePercentage,
        mergeTables: mergeTables,
        computePercentageOutOfPrimary: computePercentageOutOfPrimary,
        groupByVarianceCosts: groupByVarianceCosts,
      };
    },
  ]);
