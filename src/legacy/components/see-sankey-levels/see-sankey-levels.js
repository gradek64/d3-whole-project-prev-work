/**
 * Created by joshrayman on 5/12/2016.
 */

/* eslint-disable */
/* prettier-ignore */

angular.module('app').filter('decodeURIComponent', function() {
  console.log("decode");
  return window.decodeURIComponent;
});

angular.module('app')
.directive('seeSankeyLevels', function() {

  function init(scope) {
    scope.$on('resetSankey', function(){
      console.log("reset sankey");
      scope.confirmRemoveChartSource();
    });

    // used by classification and groupby updates, seemingly.
    function updateSankey(classification)
    {
      var data = {
        id: scope.chartInfo.id,
        selected: classification.activeGroupBy,
        selectedLevels: scope.sankeyPicked
      };

      scope.$emit("updateSankey", data);
    }

    /**
     * Change source classification
     */
    scope.changeChartSourceClassification = function(classification)
    {
      scope.chartInfo.sourceGrouping.selected = classification;
      scope.chartInfo.sourceGrouping.selected.activeGroupBy = classification.groupBy[0];

      scope.sankeyPicked.push(classification);

      scope.chartInfo.sankeyClassification.selected = [ null ];

      updateSankey(classification);
    };

    scope.checkSourceValue = function(value)
    {
      return (scope.chartInfo.sourceGrouping.selected.activeGroupBy.display === value.display);
    };

    /**
     * Change source groupby
     */
    scope.changeChartSourceGrouping = function(groupby)
    {
      scope.chartInfo.sourceGrouping.selected.activeGroupBy = groupby;

      updateSankey(groupby);
    };

    scope.removeChartSource = function(sel) {
      angular.element("#reset").modal('show');
    };

    /**
     * Reset diagram
     */
    scope.confirmRemoveChartSource = function()
    {
      scope.$emit("removeChartSource");
      scope.sankeyPicked = [];

      angular.element("#reset").modal('hide');
    };

    /**
     * Remove level (open modal)
     */
    scope.removeChartGrouping = function(level, name)
    {
      scope.selectedForDelete = { level: level, name: name };
      angular.element("#delete").modal('show');
    };

    /**
     * Remove level (confirm)
     */
    scope.confirmRemoveChartGrouping = function()
    {
      console.log(scope.selectedForDelete, scope.sankeyPicked);

      var idx = scope.sankeyPicked.map(function(d) { return d.level }).indexOf(scope.selectedForDelete.level);

      var removed = angular.copy(scope.sankeyPicked[idx]);
      scope.sankeyPicked.splice(idx, 1);

      console.log(removed, idx, scope.sankeyPicked);

      var data = {
        id: scope.chartInfo.id,
        selectedLevels: scope.sankeyPicked,
        removed: removed,
        isAdd: false
      };

      if (data.removed) {
        var idx = scope.chartInfo.sankeyClassification.selected.map(function (d) {
          if (d) {
            return d.level;
          }
        }).indexOf(removed.level);

        scope.chartInfo.sankeyClassification.selected.splice(idx, 1);

        scope.$emit("updateSankey", data);
      }

      angular.element("#delete").modal('hide');
    };

    scope.sankeyPicked = [];

    /**
     * Change level classification
     * @param groupby
     * @param level
     */
    scope.changeChartLevelClassification = function(classification, level)
    {
      scope.chartInfo.sankeyClassification.selected = scope.chartInfo.sankeyClassification.selected || [];

      scope.chartInfo.sankeyClassification.selected[level] = classification;
      scope.chartInfo.sankeyClassification.selected[level + 1] = null;

      scope.sankeyPicked.push(classification);

      var data = {
        id: scope.chartInfo.id,
        selectedLevels: scope.sankeyPicked,
        selected: classification,
        level: level,
        isAdd: !(scope.chartInfo.sankeyClassification.selected[level].name) ? true : false
      };

      scope.$emit("updateSankey", data);
    };

    /**
     * Change level groupby
     * @param groupby
     * @param level
     */
    scope.changeChartLevelGrouping = function(groupby, level)
    {
      scope.chartInfo.sankeyClassification.selected[level].activeGroupBy = groupby;

      var data = {
        id: scope.chartInfo.id,
        selectedLevels: scope.sankeyPicked,
        selected: groupby,
        level: level,
        isAdd: !(scope.chartInfo.sankeyClassification.selected[level].name) ? true : false
      };

      if (data.isAdd === true) {
        scope.chartInfo.sankeyClassification.selected[level + 1] = scope.chartInfo.sankeyClassification.selected[level + 1] || {};
      }

      scope.$emit("updateSankey", data);
    };

    /**
     * Get list of filters for selected groupBy
     * @param listGroupBy
     * @returns {*}
     */
    scope.getFilterList = function(classification) {
      if(classification && classification.groupBy) {
        var groupByMap = classification.groupBy.map(function(d){ return d.value; });
        return scope.chartInfo.filters.filter(function(d){ return (groupByMap.indexOf(d.groupBy) > -1)});
      }
      else {
        return null;
      }
    };

    /**
     * Toggle selected filter
     * @param filter
     */
    scope.toggleFilter = function(event, filter) {
      event.preventDefault();
      event.stopPropagation();

      filter.selected = !filter.selected;
      scope.$emit("changeSankeyFilter");
    };

    /**
     * Remove all filters from selected list
     * @param filters
     */
    scope.clearFilters = function(event, filters) {
      for(var i = 0; i < filters.length; i++)
      {
        filters[i].selected = false;
      }
      scope.$emit("changeSankeyFilter");
    };


    /**
     * filters additional sankey levels down to what should be available to the user
     *
     * note: had to swap lookup from d.value to d.display because infrastructure is duplicate
     * of the classification with different presentation labels.. (per requirements.)
     *
     * @returns {*}  output list
     */
    scope.filterDropdownList = function() {
      var picked = scope.sankeyPicked.map(function(d){ return d.name; });
      var list = [];

      for(var x in scope.chartInfo.sankeyClassification.all) {
        list.push(scope.chartInfo.sankeyClassification.all[x]);
      };
      var dir = checkChartDirection();

      var filteredList;

      if(dir === "down") {
        //remove items above selected from list
        filteredList = list.filter(function(d) { return d.level < scope.sankeyPicked[scope.sankeyPicked.length - 1].level; });
      }
      else if(dir === "up") {
        //remove items below selected from list
        filteredList = list.filter(function(d) { return d.level > scope.sankeyPicked[scope.sankeyPicked.length - 1].level; });
      }
      else {
        //remove selected items from list
        filteredList = list.filter(function(d){ return (picked.indexOf(d.name) === -1); });
      }

      //find instance of level 2 sankey classification (Labour, Contract, Other)
      var levelTwoIdx = scope.sankeyPicked.map(function(d){ return d.level; }).indexOf(2);

      if(levelTwoIdx !== -1) {
        //if level 2 is found, remove additional instances)
        filteredList = filteredList.filter(function(d) { return (d.level !== 2 || d.name === scope.sankeyPicked[levelTwoIdx].name); });
      }

      //find instance of level 4 sankey classification (Infrastructure top level)
      var levelFourIdx = scope.sankeyPicked.map(function(d){ return d.level; }).indexOf(4);

      if(levelFourIdx !== -1) {
        //if level 4 is found, remove additional instances)
        filteredList = filteredList.filter(function(d) {
          return (d.level !== 4)
        });
      }

      return filteredList;
    };

    /**
     * return dropdown if all conditions met - a dynamic sankey with selected classification and a groupby list with length > 0.
     * @param sel
     * @returns {boolean|*}
     */
    scope.isDropdownVisible = function()
    {
      return (scope.chartInfo.dynamicSource && scope.chartInfo.type === 'sankey' && scope.chartInfo.sourceGrouping.selected.display &&
          scope.chartInfo.sankeyClassification.all);
    };

    /**
     * Takes first two levels selected for a dynamic sankey, determines if they are ascending or descending,
     * which is used to deliver the rest of the available options (locking direction)
     *
     * @param listMap   map of all sankey levels
     * @returns {*}
     */
    function checkChartDirection() {
      if(scope.sankeyPicked.length > 1) {
        var firstLevel = scope.chartInfo.sankeyClassification.all[scope.sankeyPicked[0].name].level;
        var secondLevel = scope.chartInfo.sankeyClassification.all[scope.sankeyPicked[1].name].level;

        // if first level is greater than second, sankey is going down the model
        return (firstLevel > secondLevel) ?  "down" : "up";
      }
      else {
        return "none";  //not enough levels picked to determine direction (if picking a level in the middle, you could go either up or down.
      }
    }

    /**
     *
     * @param type      source, group, level
     * @param levelSet  false = it's an add level button (different size)
     * @returns {*}
     */
    scope.calculateWidth = function(type, levelSet)
    {
      if(type === "level" && !levelSet) { return ""; }   //Add level doesn't need to be styled in the same way.

      var levelWidth = 2;
      var sourceWidth = 3;
      var levelOffset = 0;

      switch(scope.sankeyPicked.length)
      {
        case 1:
          levelWidth = 3;
          levelOffset = 9;
          break;
        case 2:
          levelWidth = 3;
          levelOffset = 6;
          break;
        case 3:
          levelWidth = 4;
          sourceWidth = 4;
          break;
        case 4:
          levelWidth = 3;
          break;
        case 5:
          sourceWidth = 2;
          break;
        default:
          break;
      }

      if(type === "source") {
        //offset on smallest version (source offset centres the whole level system)
        if(sourceWidth === 2) {
          sourceWidth = sourceWidth + " col-xs-offset-1";
        }

        return "col-xs-"+ sourceWidth;
      }
      else {
        //group
        return "col-xs-" + levelWidth + " col-xs-offset-" + levelOffset;
      }
    }
  }

  return {
    restrict: 'E',
    scope: {
      chartInfo: '=info'
    },
    templateUrl: 'legacy/components/see-sankey-levels/see-sankey-levels.html',
    link: init
  };
});

