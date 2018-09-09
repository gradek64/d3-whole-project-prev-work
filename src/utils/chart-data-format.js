/**
 * Created by Sergiu Ghenciu on 20/02/2018
 *
 * This file has been migrated from the legacy app as it was
 */

'use strict';
/* eslint-disable */
angular
  .module('utils.chart-data-format', ['utils.misc'])
  .factory('chartDataFormat', [
    'misc',
    function(_) {
      const space = '\xa0\xa0';

      const addParentheses = str => '(' + str + ')';

      const formatNumber = (n, decimals, comma, dot) =>
        _.formatNumber(_.abs(n), decimals, comma, dot);

      const formatPercentage = (n, isNegative) => {
        if (n === null) {
          return '-';
        }

        let str = formatNumber(n, 1) + '%';

        if (isNegative) {
          str = '-' + str;
        }
        return str;
      };

      const formatCurrency = (d, isNegative, currency) => {
        if (d === null) {
          return '-';
        }

        let str = formatNumber(d);

        if (currency) {
          str = currency + str;
        }

        if (isNegative) {
          str = addParentheses(str);
        }

        return str;
      };

      const kFormatter = (n, isNegative, currency) => {
        let str = Math.abs(Math.round(n));
        if (str > 1000000) {
          str = Math.round(str / 1000000) + 'M';
        } else if (str >= 1000) {
          str = Math.round(str / 1000) + 'K';
        }

        if (currency) {
          str = currency + str;
        }

        if (isNegative) {
          str = addParentheses(str);
        }

        return str;
      };

      const formatToolTipText = (
        n,
        isNegative,
        currency,
        percentage,
        label
      ) => {
        let str = formatCurrency(n, isNegative, currency);

        if (label) {
          str = label + space + str;
        }

        if (_.def(percentage)) {
          str += space + formatPercentage(percentage, percentage < 0);
        }
        return str;
      };

      // function formatWaterfallTooltipText(d) {
      //   var str =
      //     d.name + spaceStr + formatCurrency(d.value, d.value < 0, true);
      //
      //   if (d.percentage) {
      //     str += spaceStr + formatPercentage(d.percentage) + '%';
      //   }
      //
      //   return str;
      // }

      /*
      function formatSankeyText(d, getId) {
        return (
          d.parent +
          '\n' +
          getId(d.source.id) +
          spaceStr +
          formatNumber(d.source.value, d.isNegative, true) +
          ' → ' +
          getId(d.target.id) +
          '\n' +
          formatNumber(d.value, d.isNegative, true)
        );
      }

      function formatSankeyNodeText(d, getId) {
        return getId(d.id) + ' ' + formatNumber(d.value, d.isNegative, true);
      }

      function formatSankeyTableText(d, level, accessor) {
        var isNegative = d.isNegative;
        var datum = accessor ? d[level][accessor] : d[level];

        datum = formatDatum(level, datum, isNegative, false, accessor);

        return datum || ''; //data.data.name; })
      }

      function formatVarianceSpanText(d, level, isNumber) {
        var isNegative = d[level] < 0;
        var value = isNumber ? Math.abs(d[level]) : d[level];

        value = formatDatum(level, value, isNegative, isNumber);

        return value || '';
      }

      function formatSpanText(d, level, isNumber, isDate) {
        var isNegative = d.isNegative;
        var value = d[level];

        value = formatDatum(level, value, isNegative, isNumber);

        if (isDate && value !== 'Total') {
          value = moment(+value).format('DD/MM/YYYY');
        }

        return value || '';
      }

      function formatDatum(level, datum, isNegative, isNumber, accessor) {
        if (!datum) {
          return null; // abandon if no data
        }

        if (
          level === 'units' ||
          level === 'value' ||
          accessor === 'value' ||
          isNumber
        ) {
          datum = formatNumber(datum, isNegative, false);
        }

        if (level === 'total') {
          datum = formatNumber(datum, isNegative, true);
        }

        if (level === 'percentage') {
          datum = formatPercentage(datum);
        }

        if (datum.indexOf('/ ') > -1) {
          datum = datum.split('/ ')[1];
        }

        return datum;
      }

      function formatBubble(d) {
        return (
          d.key +
          '\nVal 1: ' +
          d.val1 +
          '\nVal 2: ' +
          d.val2 +
          '\nVal 3: ' +
          d.val3
        );
      }

      function formatChordTip(d) {
        return (
          'Chord Info:' +
          '\n' +
          formatNumber(d.svalue, d.isNegative, false) +
          spaceStr +
          calculatePercentage(d.svalue, d.stotal) +
          ' of ' +
          d.sname +
          ' to ' +
          d.tname +
          '\n' +
          formatNumber(d.tvalue, d.isNegative, false) +
          spaceStr +
          calculatePercentage(d.tvalue, d.ttotal) +
          ' of ' +
          d.tname +
          ' to ' +
          d.sname
        );
      }

      function formatChordGroup(d) {
        return (
          d.gname +
          '\n' +
          formatNumber(d.gvalue, d.isNegative, false) +
          spaceStr +
          calculatePercentage(d.gvalue, d.mtotal) +
          ' of Total'
        );
      }

      function formatForceText(d) {
        return d.id + spaceStr + formatNumber(d.value, d.isNegative, true);
      }

      function formatSunburstLabel(d) {
        var target = d.children || !d.parent ? d : d.parent;
        var isNegative = findData(target.data.values[0]);

        var text =
          target.data.key + spaceStr + formatNumber(d.value, isNegative, true);

        var perc = '';

        if (d.parent && d.parent.value > 0 && d.value > 0) {
          perc = calculatePercentage(d.value, d.parent.value);
        }

        if (perc !== '') {
          text = text + spaceStr + perc;
        }

        return text;
      }

      function formatNumberText(d) {
        return formatNumber(d.value, findData(d.data), true);
      }

      function formatTooltipText(d, isDate, total) {
        var datum = d.data ? d.data : d;
        var key = isDate ? moment(d.date).format('DD/MM/YYYY') : datum.key;
        var isNegative = datum.isNegative;

        var str = key + spaceStr + formatNumber(datum.value, isNegative, true);

        if (d.data && d.data.perc) {
          str += spaceStr + formatPercentage(datum.perc) + '%';
        }

        if (total) {
          var perc = formatPercentage(datum.value / total * 100);
          str += spaceStr + perc + '%';
        }

        return str;
      }

      function formatWaterfallTooltipText(d) {
        var str =
          d.name + spaceStr + formatCurrency(d.value, d.value < 0, true);

        if (d.percentage) {
          str += spaceStr + formatPercentage(d.percentage) + '%';
        }

        return str;
      }

      function formatRowTooltipText(d, value, total) {
        return (
          d.key +
          spaceStr +
          formatNumber(value, d.isNegative, true) +
          spaceStr +
          calculatePercentage(value, total)
        );
      }
*/
      return {
        kFormatter,
        formatPercentage,
        formatToolTipText,
        formatCurrency
      };
    }
  ]);
