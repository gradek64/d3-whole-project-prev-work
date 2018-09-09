/**
 * Created by joshrayman on 05/07/2017.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').service('ChartIconService',
    function() {
      // get chart icon list and set selected chart icon.
      function getChartIcons(chartInfo) {
        var icons = [{ "type" : "table", "icon" : "grid_on" },
          { "type" : "line", "icon" : "line-chart" },
          { "type" : "area", "icon" : "area-chart" },
          { "type" : "bar", "icon" : "bar-chart" },
          { "type" : "donut", "icon" : "dot-circle-o" },
          { "type" : "pie", "icon" : "pie-chart" },
          { "type" : "tree", "icon" : "view_quilt" },
          { "type" : "partition", "icon" : "columns" },
          { "type" : "sunburst", "icon" : "dot-circle-o" },
          { "type" : "force-p", "icon" : "circle-o" },
          { "type" : "force", "icon" : "circle" },
          { "type" : "map", "icon" : "place" },
          { "type" : "sankey", "icon" : "shuffle" },
          { "type" : "bubble", "icon" : "circle" },
          { "type" : "rows", "icon" : "bar-chart" },
          { "type" : "table-breakdown", "icon" : "grid_on" },
          { "type" : "chord", "icon": "radio_button_checked" },
          { "type" : "waterfall", "icon": "bar-chart" },
          { "type" : "percentage", "icon" : "percentage" }
        ];

        // set selected icon icon (shown at top of chart toggle list).
        if(chartInfo.type) {
          var iconsList = icons.filter(function(d){ return d.type === chartInfo.type; });

          if(iconsList.length > 0) {
            chartInfo.defaultIcon = iconsList[0].icon;
          } else {
            throw new Error("Invalid Chart Type Specified");
          }

          // if icons have already been defined (eg. chart type change after page load)
          // don't add chart icons again
          if(chartInfo.chartOptions) {
            return chartInfo;
          }

          var selectedIcons = [];

          switch(chartInfo.type) {
            case "line":
            case "area":
              selectedIcons = [icons[1], icons[2], icons[3]];
              break;
            case "bar":
              if(chartInfo.axisInfo && chartInfo.axisInfo.xType === 'ordinal') {
                selectedIcons = [icons[3], icons[4], icons[5]];
              }
              else {
                selectedIcons = [icons[1], icons[2], icons[3]];
              }
              break;
            case "donut":
            case "pie":
              selectedIcons = [icons[3], icons[4], icons[5]];
              break;
            case "tree":
            case "partition":
              selectedIcons = [icons[6]];
              break;
            case "sunburst":
              selectedIcons = [icons[6], icons[7], icons[8]];
              break;
            case "force":
            case "force-p":
              selectedIcons = [icons[9], icons[10]];
              break;
            case "map":
              selectedIcons = [icons[11]];
              break;
            case "sankey":
              selectedIcons = [icons[12]];
              break;
            case "bubble":
              selectedIcons = [icons[13]];
              break;
            case "table-breakdown":
              selectedIcons = [icons[15]];
              break;
            case "chord":
              selectedIcons = [icons[16]];
              break;
            case "waterfall":
              selectedIcons = [icons[17]];
            default:
              break;
          }

          // alternative types can be specified (eg. table with sunburst alt option) - used for alternate
          // chart types not set out by the original requirements.
          if(chartInfo.alternativeType) {
            for (var i = 0; i < chartInfo.alternativeType.length; i++) {
              var altType = chartInfo.alternativeType[i];

              switch (altType) {
                case "line":
                  selectedIcons.push(icons[1]);
                  break;
                case "area":
                  selectedIcons.push(icons[2]);
                  break;
                case "bar":
                  selectedIcons.push(icons[3]);
                  break;
                case "donut":
                  selectedIcons.push(icons[4]);
                  break;
                case "pie":
                  selectedIcons.push(icons[5]);
                  break;
                case "tree":
                  selectedIcons.push(icons[6]);
                  break;
                case "partition":
                  selectedIcons.push(icons[7]);
                  break;
                case "sunburst":
                  selectedIcons.push(icons[8]);
                  break;
                case "force":
                  selectedIcons.push(icons[10]);
                  break;
                case "force-p":
                  selectedIcons.push(icons[9]);
                  break;
                case "map":
                  selectedIcons.push(icons[11]);
                  break;
                case "sankey":
                  selectedIcons.push(icons[12]);
                  break;
                case "bubble":
                  selectedIcons.push(icons[13]);
                  break;
                case "table-breakdown":
                  selectedIcons.push(icons[15]);
                  break;
                case "chord":
                  selectedIcons.push(icons[16]);
                  break;
                case "waterfall":
                  selectedIcons.push(icons[17]);
                default:
                  break;
              }
            }
          }

          // all charts except cost flows (dynamic sankey) should have a table option.
          // TODO: waterfall is an issue with the different table data structure. Some attempts to
          // fix have been made but was unsuccessful.
          if(chartInfo.dynamicSource !== true && chartInfo.type !== 'waterfall') {
            selectedIcons.push(icons[0]);
          }

          chartInfo.chartOptions = selectedIcons;

          return chartInfo;
        } else {
          throw new Error("No Chart Type Specified");
        }
      }

      return {
        getChartIcons: getChartIcons
      }
    });
