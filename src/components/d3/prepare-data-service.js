/**
 * Created by Sergiu Ghenciu on 08/03/2018
 *
 * All this service does is to normalize the data according to the accessor
 * (1) e.g.
 * data = [{x: 1}, {x: 2}];
 * accessor = {value: 'x'};
 * normalize(data, accessor) -> [{value: 1}, {value: 2}]
 *
 * Also it returns only the specified properties in the accessor
 * (2) e.g.
 * data = [{name: 'a', amount: 1, id: 1}, {name: 'b', amount: 2, id: 2}];
 * accessor = {label: 'name', value: 'amount'};
 * normalize(data, accessor) -> [{label: 'a', value: 1}, {label: 'b', value: 2}]
 *
 * !note that `id` property has been excluded from the input data
 */

'use strict';

angular
  .module('components.d3.prepare-data-service', [
    'utils.misc',
    'utils.chart-data-format',
  ])
  .factory('prepareDataService', [
    'misc',
    'chartDataFormat',
    function(_, chartDataFormat) {
      // eslint-disable-next-line
      const sbData = [
        {_id: 1, height: 1, depth: 1, label: 'Database'},
        {
          _id: 2,
          _parent: 1,
          height: 0,
          depth: 2,
          label: 'MS SQL',
          value: 4644.18,
        },
        // {_id: 30, _parent: 2, label: '', value: 4644.18},

        {
          _id: 3,
          _parent: 1,
          height: 0,
          depth: 2,
          label: 'Oracle',
          value: 1456.49,
        },
        // {_id: 40, _parent: 3, label: '', value: 1456.49},

        {_id: 4, height: 2, depth: 1, label: 'Datacenter'},
        {_id: 5, _parent: 4, height: 1, depth: 2, label: 'Earl St'},
        {
          _id: 6,
          _parent: 5,
          height: 0,
          depth: 3,
          label: 'Earl St Rent and Power',
          value: 126272.1,
        },

        {_id: 7, height: 2, depth: 1, label: 'Server Hardware'},
        {_id: 8, _parent: 7, height: 1, depth: 2, label: 'HP'},
        {
          _id: 9,
          _parent: 8,
          height: 0,
          depth: 3,
          label: 'BSL HP Labour and Staffing',
          value: 4644.18,
        },

        {
          _id: 10,
          height: 0,
          depth: 1,
          label: 'Applications',
          value: 6136.78,
        },
        // {_id: 11, _parent: 10, label: ''},
        // {
        //   _id: 12,
        //   _parent: 11,
        //   label: '',
        //   value: 6136.78,
        // },

        {_id: 13, height: 1, depth: 1, label: 'Network & Telecoms'},
        {
          _id: 14,
          height: 0,
          depth: 2,
          _parent: 13,
          label: 'Internal Network',
          value: 4644.18,
        },
        // {
        //   _id: 15,
        //   _parent: 14,
        //   label: '',
        //   value: 4644.18,
        // },

        {_id: 16, height: 1, depth: 1, label: 'Server Operating Systems'},
        {
          _id: 17,
          height: 0,
          depth: 2,
          _parent: 16,
          label: 'Solaris',
          value: 6944.62,
        },
        // {
        //   _id: 18,
        //   _parent: 17,
        //   label: '',
        //   value: 6944.62,
        // },

        {_id: 19, height: 1, depth: 1, label: 'IT Management'},
        {
          _id: 20,
          _parent: 19,
          height: 0,
          depth: 2,
          label: 'BSL IT Management',
          value: 7282.47,
        },
        // {
        //   _id: 21,
        //   _parent: 20,
        //   label: '',
        //   value: 7282.47,
        // },

        {_id: 22, height: 2, depth: 1, label: 'Delivery Services'},
        {
          _id: 23,
          height: 1,
          depth: 2,
          _parent: 22,
          label: 'Change Mgmt & Reporting',
        },
        {
          _id: 24,
          _parent: 23,
          height: 0,
          depth: 3,
          label: 'LCH Change Mgmt & Reporting',
          value: 10923.71,
        },
      ];
      // eslint-disable-next-line
      const skData = {
        nodes: [
          {id: 0, label: 'Lorem'},
          {id: 1, label: 'Ipsum'},
          {id: 2, label: 'Dolor'},
          {id: 3, label: 'Sit'},
          {id: 4, label: 'Amet'},
          {id: 5, label: 'Consectetur'},
          {id: 6, label: 'Adipiscing'},
          {id: 7, label: 'Elit'},
          {id: 8, label: 'Integer'},
          {id: 9, label: 'Consequat'},
          {id: 10, label: 'Felis'},
        ],
        links: [
          {source: 1, target: 3, value: 2},
          {source: 0, target: 4, value: 2},
          {source: 2, target: 4, value: 2},
          {source: 1, target: 4, value: 4},
          {source: 0, target: 3, value: 4},
          {source: 5, target: 4, value: 4},
          {source: 6, target: 3, value: 4},
          {source: 7, target: 3, value: 3},
          {source: 8, target: 3, value: 1},
          {source: 9, target: 3, value: 2},
          {source: 10, target: 3, value: 2},
        ],
      };
      // eslint-disable-next-line
      const wfData = [
        {
          label: 'Staff',
          table1: 22794.81,
          table2: 5263.2,
          costVariance: -17531.61,
        },
        {
          label: 'Non-Staff',
          table1: 22150.34,
          table2: 3812.25,
          costVariance: -18338.09,
        },
        {
          label: 'Other',
          table1: 5824.0,
          table2: 1523.65,
          costVariance: -4300.35,
        },
      ];

      const computeTotal = (data, accessor) =>
        data.reduce((a, e) => a + e[accessor], 0);

      const addPercentage = (data, accessor, total) => {
        if (_.undef(total)) {
          total = computeTotal(data, accessor);
        }

        return data.map((e) => {
          e.percentage = _.percentage(e[accessor], total);
          return e;
        });
      };

      const nestFactory = (accessor) => {
        let key = (keys, depth, obj, i = 0) => {
          if (i > depth) {
            return '';
          }
          return `${obj[keys[i]]}${key(keys, depth, obj, i + 1)}`;
        };

        // let nest = (keys, data) => {
        //   let id = 0;
        //   let map = {};
        //   let res = [];
        //   data.forEach((e) => {
        //
        //     keys.forEach((k, i) => {
        //
        //
        //       let j = key(keys, i + 1, e);
        //
        //       if (!map[j]) {
        //         id++;
        //         map[j] = id;
        //
        //         let o = {label: e[k], _id: id};
        //
        //         if (i > 0) {
        //           o._parent = map[key(keys, i, e)];
        //         }
        //
        //         if (i === keys.length - 1) {
        //           o.value = e.value;
        //         }
        //
        //         res.push(o);
        //       }
        //     });
        //   });
        // parent = (e) => temp1.find((a) => a._id === e._parent);

        //
        // okParent = (e) => {
        //   let p = parent(e);
        //   return def(p.label) ? p : okParent(p)
        //
        // }
        //
        //
        //   return res;
        // };

        let nest = (data, keys = [], depth = 0) => {
          let id = 0;
          let map = {};
          let res = [];
          data.forEach((e) => {
            let flag = false;
            keys.forEach((k, i) => {
              if (flag) {
                return;
              }
              if (!e[k]) {
                res[res.length - 1]['value'] = e[accessor.value];
                flag = true;
                return;
              }

              let j = key(keys, i, e);

              if (!map[j]) {
                id++;
                map[j] = id;
                // todo: compute height and depth separately
                let o = {label: e[k], _id: id, depth: i + 1};
                if (i > 0) {
                  o._parent = map[key(keys, i - 1, e)];
                }
                if (i === keys.length - 1) {
                  o.value = e[accessor.value];
                }
                res.push(o);
              }
            });
          });

          // todo: add isNegative to all leaves
          res.forEach((e, i) => {
            if (e.value < 0) {
              res[i].value = Math.abs(e.value);
              res[i].isNegative = true;
            }
          });

          return res;
        };

        return nest;
      };

      const extract = (keys, accessor) => (obj) =>
        keys.reduce((a, k) => {
          a[k] = obj[accessor[k]];
          return a;
        }, {});

      const group = (links) => {
        let map = {};
        return links.reduce((a, e) => {
          let k = `${e.source}${e.target}`;
          if (_.def(map[k])) {
            a[map[k]].value += e.value;
          } else {
            let i = a.push(e);
            map[k] = i - 1;
          }

          return a;
        }, []);
      };

      const chord = (data, accessor) => {
        const keys = Object.values(accessor).filter(
          (e) =>
            e !== accessor.value &&
            e !== accessor.id &&
            e !== accessor.percentage
        );

        let i = 0;
        const map = data.reduce((a, e) => {
          keys.forEach((k) => {
            if (a[e[k]] === undefined) {
              a[e[k]] = i++;
            }
          });
          return a;
        }, {});

        const nodes = Object.keys(map).map((e) => {
          return {index: map[e], id: map[e], label: e};
        });

        // let linksMap = {};

        let links = data.reduce((a, e) => {
          // console.log(e[keys[0]], e[keys[1]], Math.abs(e[accessor.value]));
          let k = _.copy(keys);

          while (_.length(k) > 1) {
            let first = k.shift();

            a.push({
              source: map[e[first]],
              target: map[e[k[0]]],
              value: Math.abs(e[accessor.value]),
              isNegative: e[accessor.value] < 0,
            });
          }

          return a;
        }, []);

        // console.log(map);
        // console.log(nodes);
        // console.log(links.map((e) => Object.assign({}, e)));
        // console.log(group(links.map((e) => Object.assign({}, e))));
        // console.log('data', data);

        return {nodes: nodes, links: group(links)};
      };

      const prepare = (data, type, accessor) => {
        // if (type === 'waterfall') {
        //   return wfData;
        // }
        if (type === 'chord') {
          // return chData;
          return chord(data, accessor);
        }
        if (type === 'sankey') {
          // return skData;
          return chord(data, accessor);
        }

        if (type === 'sunburst' || type === 'treemap') {
          // return sbData;
          const keys = Object.values(accessor).filter(
            (e) =>
              e !== accessor.value &&
              e !== accessor.id &&
              e !== accessor.percentage
          );

          return nestFactory(accessor)(data, keys);
        }

        // if (type === 'percentage') {
        //   console.log('--- is percentage ----');
        //   return [
        //     {letter: 'A', value: 20},
        //     {letter: 'B', value: 20},
        //     {letter: 'C', value: 20},
        //     {letter: 'D', value: 10},
        //     {letter: 'E', value: 10, isNegative: true},
        //     {letter: 'F', value: 5, isNegative: true},
        //     {letter: 'G', value: 15},
        //   ];
        // }

        if (type === 'table') {
          return data.map(extract(Object.keys(accessor), accessor));
        }

        return data.map((e) => {
          const o = extract(Object.keys(accessor), accessor)(e);

          if (o.value < 0) {
            o.value = Math.abs(o.value);
            o.isNegative = true;
          }
          return o;
        });
      };

      return {prepare, computeTotal, addPercentage};
    },
  ]);
