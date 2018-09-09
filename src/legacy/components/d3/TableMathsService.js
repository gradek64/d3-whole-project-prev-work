/**
 * Created by joshrayman on 24/01/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('TableMathsService', ['ChartDataFormat', function(ChartDataFormat) {
  function addTotalRow(data, type)
  {
    //-------------------     Add total and percentage
    //  TODO need to fix this being called more than once without new data as it caused a duplicate.
    //
    if(data && data.length > 0 && data[data.length - 1].level1 !== "Total") {
      var total = 0;
      var totalCount = 0;
      var totalRenewal = 0;
      var isNegative = false;

      for(var i = 0; i < data.length; i++) {
        var val = isNaN(data[i].total) ? 0 : data[i].total;
        val *= (data[i].isNegative) ? -1 : 1;

        total += val;
        totalCount += isNaN(data[i].units) ? 0 : data[i].units;

        if(type === "bubble") {
          totalRenewal += data[i].renewal;
        }
      }

      if(total < 0) {
        isNegative = true;
      }

      var totalRow = { level1: "Total", level2: "", level3: "", total: total, units: totalCount, percentage: 100, isNegative: isNegative };

      if(type === "bubble") {
        totalRow.renewal = totalRenewal;
      }

      //-------------------     Add Percentage
      for(var i = 0; i < data.length; i++) {
        data[i].percentage = ChartDataFormat.formatPercentage((data[i].total / total) * 100);
      }

      data.push(totalRow);
    }

    return data;
  }

  return {
    addTotalRow: addTotalRow
  }
}]);
