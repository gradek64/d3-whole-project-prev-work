/**
 * Created by Sergiu Ghenciu on 20/02/2018
 *
 * This file has been migrated from the legacy app as it was
 */

'use strict';

/* eslint-disable */
angular
  .module('components.d3.table-service', [
    'components.multiple-grouped',
    'components.multiple-select',
    'utils.chart-data-format',
    'utils.misc'
  ])
  .service('tableService', [
    '$compile',
    'chartDataFormat',
    'misc',
    '$rootScope',
    function($compile, chartDataFormat, _, $rootScope) {
      return function(_scope) {
        if (_.undef(_scope.dataToDownload)) {
          _scope.dataToDownload = [];
        }
        var outer, inner;
        var innerHeightOffset = 0;
        var sortClicks = {};
        var filters = {};
        var filteredData = [];
        var compareFunction;
        var overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.left = '0';
        overlay.style.background = 'rgba(255, 255, 255, 0.5)';
        overlay.innerHTML =
          '<h3 style="color:#555;margin-top:91px;text-align:center">Your search returned no data</h3>';

        function init() {
          //scope.margin = { top: 0, right: 0, bottom: 0, left: 0 };
        }

        function escapeRegExp(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        function onFilterChange(data, opts, tbody, selected, columns) {
          // console.log( selectedCounter );
          //
          //
          // var selected = Object.keys(selectedCounter);

          filteredData = selected.map(function(e) {
            return data[e];
          });

          // if(filteredData.length === 0) {
          //   filteredData = data.slice(0);
          // }

          if (compareFunction) {
            filteredData.sort(compareFunction);
          }

          var displayedData = beautifyData(
            filteredData,
            columns,
            opts.definition
          );
          _scope.dataToDownload = displayedData;

          renderBody(displayedData, tbody, opts);
        }

        function selectedEqualVisible(state, props) {
          return state[props.index].every(function(e) {
            return e.visible === e.checked;
          });
        }

        function computeFilterText(data, props, state) {
          var selected = state[props.index].reduce(function(a, e, i) {
            if (e.checked) {
              a.push(i);
            }
            return a;
          }, []);

          if (selected.length === 0 || selected.length === data.length) {
            return props.buttonText;
          }

          return selected
            .slice(0, 9)
            .map(function(e) {
              return String(data[e][props.key]);
            })
            .join(', ');
        }

        function computeState(filters) {
          var keys = Object.keys(filters);

          return keys.map(function(e) {
            var o = filters[e].lis.map(function(e) {
              return { visible: e.style.display !== 'none' };
            });

            filters[e].inputs.forEach(function(e, i) {
              o[i].checked = e.checked;
            });

            return o;
          });
        }

        function computeSelected(state, skip) {
          if (skip && skip.length) {
            state = state.filter(function(e, i) {
              return skip.indexOf(i) === -1;
            });
          }

          return _.intersectionAll(
            state.map(function(f) {
              return f.reduce(function(a, e, i) {
                if (e.checked) {
                  a.push(i);
                }
                return a;
              }, []);
            })
          );
        }

        function createDropdown(data, opts, tbody, props, columns) {
          /*var isolateScope = scope.$new(true);
            isolateScope.items = data.
                map(function(e) {
                  return {label: e[props.key]};
                });

            isolateScope.cb = onFilterChange;

            var dropdown = $compile('<multiple-grouped items="items" ' +
                'filter="true" ' +
                'text="Not applied" ' +
                'callback="cb"></multiple-grouped>')(isolateScope);

            return dropdown[0];*/

          var isolateScope = $rootScope.$new(true);

          var angEl = $compile(
            '<div>' +
              '<div class="select-wrapper multiple">' +
              '<span class="caret">▼</span>' +
              '<input dropdown="{activates: \'' +
              props.id +
              '\', beloworigin: true, autoClose: false}" callback="onToggle" type="text" class="select-dropdown" readonly="true" value="' +
              props.buttonText +
              '">' +
              '<div id="' +
              props.id +
              '" class="dropdown-content select-dropdown">' +
              '<div class="input-field">' +
              '<i class="material-icons prefix">search</i>' +
              '<input type="text" placeholder="search">' +
              '</div>' +
              '<div class="none" style="display:none">No matches found</div>' +
              '<ul>' +
              '<li>' +
              '<span>' +
              '<input type="checkbox" id="' +
              props.id +
              '-1">' +
              '<label for="' +
              props.id +
              '-1">(Select All)</label>' +
              '</span>' +
              '</li>' +
              '</ul>' +
              '</div>' +
              '</div>' +
              '' +
              '</div>'
          )(isolateScope);

          var dropdown = angEl[0];

          var button = dropdown.querySelector('input[dropdown]');
          var selectAll = dropdown.querySelector('ul li:first-child input');
          var searchInput = dropdown.querySelector('.input-field input');

          /* options */
          var lis = [];
          var inputs = [];
          filters[props.index] = {};
          data.forEach(function(e, i) {
            var li = document.createElement('li');
            var span = document.createElement('span');
            var label = document.createElement('label');
            var input = document.createElement('input');
            var text = document.createTextNode(e[props.key]);
            input.type = 'checkbox';
            input.checked = true;
            input.id = props.id + i;
            label.setAttribute('for', props.id + i);

            input.onclick = function() {
              li.dataset.dirty = !li.dataset.dirty;

              /* todo: optimize when selected Equal Visible use case */
              var state = computeState(filters);
              var a = selectedEqualVisible(state, props);
              if (a) {
                searchInput.onkeyup();
              } else {
                lis.forEach(function(e, i) {
                  if (e.style.display === 'none') {
                    inputs[i].checked = false;
                  }
                });
              }
              state = computeState(filters);

              var selected = computeSelected(state);

              button.value = computeFilterText(data, props, state);
              onFilterChange(data, opts, tbody, selected, columns);

              setTimeout(function() {
                if (a) {
                  selectAll.checked = true;
                } else {
                  selectAll.checked = false;
                }
              }, 0);
            };

            li.appendChild(span);
            span.appendChild(input);
            span.appendChild(label);
            label.appendChild(text);

            lis.push(li);
            inputs.push(input);
          });
          var o = dropdown.querySelector('ul');
          lis.forEach(function(e) {
            o.appendChild(e);
          });

          filters[props.index]['lis'] = lis;
          filters[props.index]['inputs'] = inputs;

          // on open
          isolateScope.onToggle = function(open) {
            if (open) {
              searchInput.focus();

              var state = computeState(filters);
              var selected = computeSelected(state);

              lis.forEach(function(e, i) {
                if (selected.indexOf(i) === -1) {
                  if (!lis[i].dataset.dirty) {
                    lis[i].style.display = 'none';
                    // inputs[i].checked = true;
                  }
                } else {
                  lis[i].style.display = 'list-item';
                  inputs[i].checked = true;
                }
              });
            }
          };

          searchInput.onkeyup = function() {
            var self = this;
            var re = RegExp(escapeRegExp(this.value), 'i');

            var state = computeState(filters);
            var selected = computeSelected(state, [props.index]);

            lis.forEach(function(e, i) {
              if (selected.indexOf(i) !== -1 && re.test(data[i][props.key])) {
                lis[i].style.display = 'list-item';
                inputs[i].checked = true;
              } else {
                lis[i].style.display = 'none';
                inputs[i].checked = self.value === '';
              }
            });

            state = computeState(filters);
            selected = computeSelected(state);
            button.value = computeFilterText(data, props, state);
            onFilterChange(data, opts, tbody, selected, columns);
          };

          selectAll.onclick = function() {
            var self = this;
            inputs
              .filter(function(e, i) {
                return lis[i].style.display !== 'none';
              })
              .filter(function(e) {
                return e.checked !== self.checked;
              })
              .forEach(function(e, i) {
                e.click();

                // if(!self.checked) {
                //   e.checked = false;
                //   selectedCounter[i] --;
                // } else {
                //   e.click();
                // }
              });
          };

          return dropdown;
        }

        function addOuterInner(table) {
          if (outer) {
            return;
          }

          /*
             * All it does is:
             *
             * <table></table>
             *
             *       ↓↓
             *
             * <outer>
             *  <inner>
             *   <inner2>
             *     <table></table>
             *   </inner2>
             *  </inner>
             * </outer>
             *
             * <inner2> container needed for safari and firefox negative bottom margin.
             * */
          outer = document.createElement('div');
          inner = document.createElement('div');
          var inner2 = document.createElement('div');
          //outer.style.height = 'calc(100%-60px)';
          outer.style.height = '100%';
          outer.style.position = 'relative';
          inner.style.maxHeight = '100%';
          inner.style.overflow = 'auto';
          inner2.style.overflow = 'hidden';
          inner2.style.maxHeight = '100%';

          /* append inner to outer */
          outer.appendChild(inner);

          /* append inner2 to inner */
          inner.appendChild(inner2);

          /* insert outer before table */
          table.parentNode.insertBefore(outer, table);

          /* append table to inner */
          inner2.appendChild(table);
        }

        function adjustWidth(spans, ths) {
          ths.forEach(function(e, i) {
            spans[i].style.width = e.clientWidth - 1 + 'px';
          });
        }

        function adjustTableMargin(table, thead) {
          table.style.marginTop = '-' + (thead.offsetHeight + 1) + 'px';
        }

        function beautifyData(data, columns, definition = []) {
          if (data.length === 0) {
            return [];
          }

          // var columns = Object.keys(data[0]);
          return data.map(function(row) {
            return columns.reduce(function(formatted, column, i) {
              if (definition[i] === 'currency') {
                formatted[column] = chartDataFormat.formatCurrency(
                  row[column],
                  row[column] < 0,
                  '£'
                );
              } else if (definition[i] === 'percentage') {
                formatted[column] = chartDataFormat.formatPercentage(
                  row[column],
                  row[column] < 0
                );
              } else {
                formatted[column] = row[column];
              }

              return formatted;
            }, {});
          });
        }

        function renderBody(data, tbody, opts) {
          if (data.length === 0) {
            tbody.innerHTML =
              '<tr><td style="text-align:left">&nbsp;</td></tr>';
            outer.appendChild(overlay);
            return;
          }

          overlay.remove();

          var columns = Object.keys(data[0]);

          tbody.innerHTML = '';

          data.forEach(function(row) {
            var tr = document.createElement('tr');

            columns.forEach(function(column, i) {
              var td = document.createElement('td');
              td.innerText = row[column];
              td.className = opts.definition[i];
              tr.appendChild(td);
            });

            tbody.appendChild(tr);
          });
        }

        function sortClickFactory(el, opts, index, key, columns) {
          var type = opts.definition[index];

          var table = el.querySelector('table');
          var tbody = table.querySelector('tbody');

          return function(e) {
            // var key = e.target.getAttribute('data-key');
            var order = 'ascending';

            if (sortClicks[key] === undefined) {
              sortClicks[key] = 0;
            }
            sortClicks[key]++;

            if (sortClicks[key] % 2 === 0) {
              order = 'descending';
            }

            compareFunction = _.compareFactory(
              key,
              order !== 'ascending',
              type !== 'string'
            );
            filteredData.sort(compareFunction);

            var displayedData = beautifyData(
              filteredData,
              columns,
              opts.definition
            );
            _scope.dataToDownload = displayedData;

            renderBody(displayedData, tbody, opts);

            /* manage classes  */
            table.setAttribute('data-sort-focus', index + 1);

            var floatingHeader = el.querySelector('.floating-header');
            if (floatingHeader) {
              var prev = floatingHeader.querySelector(
                '.ascending, .descending'
              );
              var curr = floatingHeader.children[index];

              if (prev && prev !== curr) {
                prev.className = '';
              }
              curr.className = order;
            }

            // it does not update the actual head of the table
            /*var prev1 = e.target.parentNode.querySelector('.ascending, .descending');

              if (prev1 && prev1 !== e.target) {
                prev1.className = '';
              }
              e.target.className = order;*/
          };
        }

        function filterFactory(el, data, opts, columns) {
          var tbody = el.querySelector('table tbody');

          return function() {
            var re = RegExp(escapeRegExp(this.value), 'i');

            filteredData = data.filter(function(row) {
              return Object.values(row).some(function(value) {
                return re.test(value);
              });
            });

            if (compareFunction) {
              filteredData.sort(compareFunction);
            }

            var displayedData = beautifyData(
              filteredData,
              columns,
              opts.definition
            );
            _scope.dataToDownload = displayedData;

            renderBody(displayedData, tbody, opts);
          };
        }

        function addSearchInput(el, opts, table, columns) {
          addOuterInner(table);

          var form = document.createElement('form');
          form.className = 'form-inline';
          form.style.marginBottom = '5px';
          form.innerHTML =
            '<br>' +
            '<div class="form-group">' +
            '<input type="text" class="form-control" id="s21" placeholder="Search...">' +
            '</div>';

          var input = form.querySelector('input');
          input.onkeyup = filterFactory(el, opts, columns);

          outer.parentNode.insertBefore(form, outer);
        }

        function addFloatingHeader(el, data, opts, table, columns) {
          addOuterInner(table);

          var keys = Object.keys(data[0]);

          /* insert the header to outer before inner */
          var floatingHeader = document.createElement('div');
          floatingHeader.className = 'floating-header bordered';
          floatingHeader.style.whiteSpace = 'nowrap';
          if (!opts.disableFilters) {
            floatingHeader.style.height = '100px';
          }
          outer.insertBefore(floatingHeader, inner);

          /* clone header */
          var ths = Array.from(table.querySelectorAll('thead th'));
          var spans = ths.map(function(e, i) {
            var div = document.createElement('div');
            var span = document.createElement('span');
            span.className = 'sorting ' + opts.definition[i];

            span.onclick = function() {
              e.click();
            };

            span.innerHTML = '<span>' + e.innerText + '</span>' + '<i></i>';

            var style = window.getComputedStyle(e);
            div.style.display = 'inline-block';
            div.style.borderBottom = style.borderBottom;
            div.style.paddingTop = style.paddingTop;
            div.style.paddingBottom = style.paddingBottom;
            div.style.paddingLeft = style.paddingLeft;
            div.style.paddingRight = style.paddingRight;
            div.style.fontWeight = style.fontWeight;
            div.style.whiteSpace = 'normal';

            span.style.display = 'inline-block';
            span.style.textAlign = style.textAlign;
            span.style.fontWeight = style.fontWeight;
            div.appendChild(span);

            if (!opts.disableFilters) {
              var id = 'tf-' + _.randomStr(4);
              div.appendChild(
                createDropdown(
                  data,
                  opts,
                  table.querySelector('tbody'),
                  {
                    buttonText: 'All',
                    index: i,
                    key: keys[i],
                    id: id
                  },
                  columns
                )
              );
            }
            floatingHeader.appendChild(div);

            return div;
          });

          /* adjust inner height and margin-top */
          var style = window.getComputedStyle(table);
          outer.style.marginTop = style.marginTop;

          innerHeightOffset += floatingHeader.offsetHeight;
          inner.style.maxHeight = 'calc(100% - ' + innerHeightOffset + 'px';

          angular.element(window).on('resize', function() {
            adjustWidth(spans, ths, table);
            adjustTableMargin(table, table.querySelector('thead'));
          });

          setTimeout(function() {
            adjustWidth(spans, ths, table);
            adjustTableMargin(table, table.querySelector('thead'));
          }, 0);
        }

        function addFloatingTotal(table, opts) {
          addOuterInner(table);

          /* append floatingTotal to outer */
          var floatingTotal = document.createElement('div');
          floatingTotal.className = 'floating-total';
          outer.appendChild(floatingTotal);

          /* clone the total row */
          var ths = Array.from(table.querySelectorAll('tfoot th'));
          var spans = ths.map(function(e, index) {
            var span = document.createElement('span');
            span.innerText = e.innerText;
            span.className = opts.definition[index];

            var style = window.getComputedStyle(e);
            span.style.display = 'inline-block';
            span.style.textAlign = style.textAlign;
            span.style.color = style.color;
            span.style.paddingTop = style.paddingTop;
            span.style.paddingBottom = style.paddingBottom;
            span.style.paddingLeft = style.paddingLeft;
            span.style.paddingRight = style.paddingRight;
            span.style.fontWeight = style.fontWeight;
            span.style.borderBottom = style.borderBottom;
            floatingTotal.appendChild(span);

            return span;
          });

          /* adjust inner height and margin-bottom */
          var style = window.getComputedStyle(table);
          outer.style.marginBottom = style.marginBottom;

          innerHeightOffset += floatingTotal.offsetHeight;
          table.style.marginBottom = '-' + floatingTotal.offsetHeight + 'px';
          table.style.overflow = 'hidden';
          inner.style.maxHeight = 'calc(100% - ' + innerHeightOffset + 'px';

          angular.element(window).on('resize', function() {
            adjustWidth(spans, ths);
          });

          setTimeout(function() {
            adjustWidth(spans, ths);
          }, 0);
        }

        function noData(el) {
          var h1 = document.createElement('h1');
          h1.style = 'text-align: center; color: #ccc; margin-top:90px;';
          h1.innerText = 'No data';
          el.appendChild(h1);
        }

        function render(el, data, opts) {
          outer = undefined;
          inner = undefined;
          innerHeightOffset = 0;

          if (!data || data.length === 0) {
            return noData(el);
          }

          if (opts.definition === undefined) {
            opts.definition = [];
          }

          filteredData = _.copy(data); // copy data
          // selectedCounter = data.reduce(function(a, e, i){a[i] = 0; return a;}, {});

          // console.log(filteredData);
          var columns = _.difference(
            ['id', 'isNegative'],
            Object.keys(filteredData[0])
          );

          var displayedData = beautifyData(
            filteredData,
            columns,
            opts.definition
          );
          _scope.dataToDownload = displayedData;

          var fakeColumns = opts.header || columns;
          if (columns.length !== fakeColumns.length) {
            console.warn('actualColumns.length !== fakeColumns.length');
            el.innerText = 'There is an error. See the console log.';
            return;
          }

          var table = document.createElement('table');
          var thead = document.createElement('thead');
          var tbody = document.createElement('tbody');

          table.className = 'table6180 bordered';
          table.appendChild(thead);
          table.appendChild(tbody);
          el.appendChild(table);

          // append the header row
          var tr = document.createElement('tr');
          fakeColumns.forEach(function(e, index) {
            var th = document.createElement('th');
            // th.setAttribute('data-key', columns[index]);
            th.innerText = e;
            th.onclick = sortClickFactory(
              el,
              opts,
              index,
              columns[index],
              columns
            );
            th.className = opts.definition[index];
            tr.appendChild(th);
          });

          thead.appendChild(tr);

          // append the footer row
          if (opts.footer) {
            tr = document.createElement('tr');
            opts.footer.forEach(function(e, index) {
              var th = document.createElement('th');
              th.innerText = e;
              th.className = opts.definition[index];
              tr.appendChild(th);
            });

            var tfoot = document.createElement('tfoot');
            tfoot.appendChild(tr);

            table.appendChild(tfoot);

            addFloatingTotal(table, opts, el);
          }

          renderBody(displayedData, tbody, opts);

          addFloatingHeader(el, data, opts, table, columns);
          // addSearchInput(opts, element, table);

          // if (opts.onClick) {
          //   cells.on('click', function (d, i) {
          //     return opts.onClick(d, i);
          //   });
          // }
        }

        function dataToCSV(data, headers, footers) {
          var header =
            headers ||
            Object.keys(data[0])
              .map(function(e) {
                return '"' + e + '"';
              })
              .join(',');

          var body = data
            .map(function(e) {
              return Object.values(e)
                .map(function(e1) {
                  return '"' + e1 + '"';
                })
                .join(',');
            })
            .join('\n');

          var footer = '';

          if (footers) {
            footer = footers
              .map(function(e) {
                return e === null ? '""' : '"' + e + '"';
              })
              .join(',');
          }

          // var total = Object.keys(data[0]).map(function(e){return '""'});
          // total[0] = '"Total"';
          // total[total.length - 1] = '"' + formatNumber(t, t < 0, true) + '"';

          return header + '\n' + body + '\n' + footer;
        }

        function download(opts) {
          _.download(
            dataToCSV(_scope.dataToDownload, opts.header, opts.footer),
            'table.csv'
          );
        }

        return {
          type: 'table',
          init: init,
          render: render,
          download: download
        };
      };
    }
  ]);
