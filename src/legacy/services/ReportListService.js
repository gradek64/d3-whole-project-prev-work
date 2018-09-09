'use strict';

/**
 * Created by joshrayman on 23/01/2017.
 */


/* eslint-disable */
/* prettier-ignore */


angular.module('app').service('ReportListService', function () {
  function getList(type, activeId) {
    var boardMetricsList = {
      parent: {name: 'Reports', url: '#!', id: 'reports'},
      reportList: [
        {
          name: 'Board Metrics',
          url: 'boardMetrics',
          id: 'board-metrics',
          text: ''
        },
        {
          name: "Departmental Charges",
          disabled: false,
          icon: "fa-bank",
          url: "departmentalCharges",
          id: "departmental-charges",
          text: "Evaluate the effectiveness of your IT Organisational Capabilities."
        },
        {
          name: 'Inter-Company Charges',
          url: 'interCompanyCharges',
          id: 'inter-company-charges',
          text: ''
        },
        {
          name: "Cost Overview",
          disabled: false,
          icon: "fa-money",
          url: "itCostOverview",
          id: "it-cost-overview",
          text: "A report to clearly show your IT costs to date and relative progress of your project as a percentage against cost, i.e. is the project over or under budget. Are your IT costs over or under budget and why?"
        },
        {
          name: "IT Resource Stack",
          disabled: false,
          icon: "fa-money",
          url: "itResourceStack",
          id: 'it-resource-stack',
          text: "See your IT costs as they begin their journey."
        },
        {
          name: "IT Service Statement",
          disabled: false,
          icon: "fa-area-chart",
          url: "itServiceStatement",
          id: 'it-service-statement',
          text: "Interrogate your entire IT cost base from inception through to delivery."
        }
      ]
    };


    var costAnalyticsList = {
      parent: {name: "Cost Analytics", url: "#!", id: "cost-analytics"},
      reportList: [
        {
          name: "Advanced Analysis",
          url: "advancedAnalysis",
          id: 'advanced-analysis'
        },
        {
          name: "Cost Flow",
          disabled: false,
          icon: "fa-area-chart",
          url: "costFlow",
          id: 'cost-flow',
          text: "See how costs move through an Organisation and the manner in which they do so."
        }
      ]
    };

    var selected = null;

    switch (type) {
      case 'reports':
        selected = boardMetricsList;
        break;
      case 'cost-analytics':
        selected = costAnalyticsList;
        break;
      default:
        break;
    }


    return selected;
  }

  function getAll() {
    return [getList('reports'), getList('cost-analytics')];
  }

  function findBy(key, value) {

    return getAll()
    .reduce(function (r, e) {
      r.push(e.parent);
      e.reportList
      .forEach(function (e1, i) {
        e1["parent"] = e.parent;
        e1["index"] = i;
        r.push(e1);
      });
      return r;
    }, [])
    .find(function (e) {
      return e[key] === value;
    });
  }

  function findById(id) {
    return findBy('id', id);
  }

  function findByUrl(url) {
    return findBy('url', url);
  }

  return {
    getList: getList,
    getAll: getAll,
    findById: findById,
    findByUrl: findByUrl
  };
});
