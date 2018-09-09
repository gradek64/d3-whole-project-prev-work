/**
 * Created by joshrayman on 02/03/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').factory('ChartDataFormat', function () {
  var spaceStr = "\xa0\xa0";

  function format(d) {
    return (isNaN(d)) ? 0 : d;
  }

  function calculatePercentage(a, b) {
    return formatPercentage(a / b * 100) + "%";
  }

  function formatNumber(d, isNegative, hasCurrency) {
    var str = '';

    if(typeof d==='string') {
      str = d;
    } else {
       str = d3.format(",.2f")(d);
    }

    if(hasCurrency) {
      str = "£" + str;
    }

    if(isNegative) {
      //str = "(" + str + ")";
    }
    return str;
  }

  function formatCurrency(d, isNegative, hasCurrency) {

    if(d === null ) {
      return '-';
    }

    var str = d3.format(",.2f")(Math.abs(d));

    if(hasCurrency) {
      str = "£" + str;
    }

    if(isNegative) {
      str = "(" + str + ")";
    }

    return str;
  }

  function kFormatter(n) {
    n = Math.round(n);
    var result = Math.abs(n);
    if (result > 1000000) {
      result = Math.round(result/1000000) + 'M';
    } else if(result > 1000) {
      result = Math.round(result/1000) + 'K';
    }
    result = '£' + result;

    if(n < 0) {
      result = '(' + result + ')';
    }
    return result;
  }

  function formatPercentage(d) {
    return d3.format(",.1f")(d);
  }

  function formatTablePercentage(d) {
    if(d === null ) {
      return '-';
    }

    return d3.format(",.1f")(d) + '%';
  }

  function formatSankeyText(d, getId) {
    return d.parent + "\n" + getId(d.source.id) + spaceStr + formatNumber(d.source.value, d.isNegative, true) + " → " + getId(d.target.id) + "\n" + formatNumber(d.value, d.isNegative, true);
  }

  function formatSankeyNodeText(d, getId) {
    return getId(d.id) + " " + formatNumber(d.value, d.isNegative, true);
  }

  function formatSankeyTableText(d, level, accessor) {
    var isNegative = d.isNegative;
    var datum = (accessor) ? d[level][accessor] : d[level];

    datum = formatDatum(level, datum, isNegative, false, accessor);

    return (datum || ""); //data.data.name; })
  }

  function formatVarianceSpanText(d, level, isNumber) {
    var isNegative = d[level] < 0;
    var value = (isNumber) ? Math.abs(d[level]) : d[level];

    value = formatDatum(level, value, isNegative, isNumber);

    return (value || "");
  }

  function formatSpanText(d, level, isNumber, isDate) {
    var isNegative = d.isNegative;
    var value = d[level];

    value = formatDatum(level, value, isNegative, isNumber);

    if(isDate && value !== "Total") {
      value = moment(+value).format("DD/MM/YYYY");
    }

    return (value || "");
  }

  function formatDatum(level, datum, isNegative, isNumber, accessor) {
    if(!datum) {
      return null;  // abandon if no data
    }

    if(level === "units" || level === "value" || accessor === "value" || isNumber) {
      datum = formatNumber(datum, isNegative, false);
    }

    if(level === "total") {
      datum = formatNumber(datum, isNegative, true);
    }

    if(level === 'percentage') {
      datum = formatPercentage(datum);
    }

    if(datum.indexOf("/ ") > -1) {
      datum = datum.split("/ ")[1];
    }

    return datum;
  }

  function formatBubble(d) { return d.key + "\nVal 1: " + d.val1 + "\nVal 2: " + d.val2 + "\nVal 3: " + d.val3}

  function formatChordTip(d) {
    return "Chord Info:" + "\n"
        + formatNumber(d.svalue, d.isNegative, false) + spaceStr + calculatePercentage(d.svalue, d.stotal) + " of "
        + d.sname + " to " + d.tname + "\n"
        + formatNumber(d.tvalue, d.isNegative, false) + spaceStr + calculatePercentage(d.tvalue, d.ttotal) + " of "
        + d.tname + " to " + d.sname;
  }

  function formatChordGroup(d) {
    return d.gname + "\n"
        + formatNumber(d.gvalue, d.isNegative, false) + spaceStr + calculatePercentage(d.gvalue, d.mtotal) + " of Total";
  }

  function formatForceText(d) {
    return d.id + spaceStr + formatNumber(d.value, d.isNegative, true);
  }

  function formatPieLabel(d, total) {
    var perc = calculatePercentage(d.data.value, total);
    return d.data.key + spaceStr + formatNumber(d.data.value, d.data.isNegative, true) + spaceStr + perc;
  }

  function findData(d)
  {
    if(!d) { return null }

    if(d.isNegative !== undefined) {
      return d.isNegative;
    }
    else {
      return findData(d.values[0]);
    }
  }

  function formatSunburstLabel(d) {
    var target = (d.children || !d.parent) ? d : d.parent;
    var isNegative = findData(target.data.values[0]);

    var text = target.data.key + spaceStr + formatNumber(d.value, isNegative, true);

    var perc = "";

    if(d.parent && d.parent.value > 0 && d.value > 0) {
      perc = calculatePercentage(d.value, d.parent.value);
    }

    if(perc !== "") {
      text = text + spaceStr + perc;
    }

    return text;
  }

  function formatNumberText(d){ return formatNumber(d.value, findData(d.data), true); }

  function formatTooltipText(d, isDate, total) {
    var datum = (d.data) ? d.data : d;
    var key = (isDate) ? moment(d.date).format("DD/MM/YYYY") : datum.key;
    var isNegative = datum.isNegative;

    var str = key + spaceStr + formatNumber(datum.value, isNegative, true);

    if(d.data && d.data.perc) {
      str += spaceStr + formatPercentage(datum.perc) + "%"
    }

    if(total) {
      var perc = formatPercentage(datum.value / total * 100);
      str += spaceStr + perc + "%";
    }

    return str;
  }

  function formatWaterfallTooltipText(d) {
    var str = d.name + spaceStr + formatCurrency(d.value, (d.value < 0), true);

    if(d.percentage){
      str += spaceStr + formatPercentage(d.percentage) + "%";
    }

    return str;
  }

  function formatRowTooltipText(d, value, total) {
    return d.key + spaceStr + formatNumber(value, d.isNegative, true) + spaceStr + calculatePercentage(value, total);
  }

  function formatSimpleTooltip(key, value) {
    return key + spaceStr + formatNumber(value);
  }

  return {
    calculatePercentage: calculatePercentage,
    formatSpanText: formatSpanText,
    formatVarianceSpanText: formatVarianceSpanText,
    formatSankeyText: formatSankeyText,
    formatSankeyNodeText: formatSankeyNodeText,
    formatSankeyTableText: formatSankeyTableText,
    format: format,
    formatPercentage: formatPercentage,
    formatNumber: formatNumber,
    formatBubble: formatBubble,
    formatChordTip: formatChordTip,
    formatChordGroup: formatChordGroup,
    formatForceText: formatForceText,
    formatPieLabel: formatPieLabel,
    formatSunburstLabel: formatSunburstLabel,
    formatNumberText: formatNumberText,
    formatTooltipText: formatTooltipText,
    formatRowTooltipText: formatRowTooltipText,
    formatSimpleTooltip: formatSimpleTooltip,
    formatWaterfallTooltipText: formatWaterfallTooltipText,
    formatCurrency: formatCurrency,
    formatTablePercentage: formatTablePercentage,
    kFormatter: kFormatter,
  };
});
