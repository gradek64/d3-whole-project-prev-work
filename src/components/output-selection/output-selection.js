/**
 * Created by Sergiu Ghenciu on 27/02/2018
 */

'use strict';

angular
  .module('components.output-selection', [
    'services.settings-service',
    'services.outputs-service',
    'services.cost-models-service',
    'utils.events',
    'utils.misc',
    'utils.constants',
  ])
  .directive('outputSelection', [
    'settingsService',
    'outputsService',
    'costModelsService',
    'events',
    'misc',
    'CONSTANTS.EVENTS',
    '$q',
    function(
      settingsService,
      outputsService,
      costModelsService,
      events,
      _,
      EVENTS,
      $q
    ) {
      const resetMap = {};

      const resetDropdown = (name, selected) => {
        resetMap[name](selected);
      };

      const buildItem = (e) => {
        return {
          label: e.name,
          value: e,
        };
      };

      const resetSelected = (scope) => {
        if (!scope || !scope.primary || !scope.items) {
          return;
        }

        if (
          !scope.items.find(
            (e) =>
              e.value.creationDate === scope.primary.creationDate &&
              e.value.name === scope.primary.name
          )
        ) {
          scope.onPrimaryChange({value: null});
        }
      };

      const initItems = (scope, configId) => {
        return outputsService
          .getAll()
          .then((res) => {
            console.log(res);
            scope.items = res.data
              // .filter((e) => e.status === 'PUBLISHED')
              .map(buildItem);

            console.log('scope.items', scope.items);
            return scope;
          })
          .catch((err) => console.log('ERROR initializing outputs:', err))
          .finally(() => {
            scope.isLoading = false;
          });
      };

      const augment = (scope) => {
        scope.dropdownResetFactory = (dropdownName) => (fn) => {
          resetMap[dropdownName] = fn;
        };

        scope.callbackFactory = (action) => (item) => {
          scope[action](item);
        };

        scope.onPrimaryChange = (item) => {
          scope.primary = item.value;
          settingsService.setPrimaryOutput(item.value);
          events.emit('PRIMARY_OUTPUT_CHANGED', item.value);
        };

        scope.onSecondaryChange = (item) => {
          scope.secondary = item.value;
          settingsService.setSecondaryOutput(item.value);
          events.emit('SECONDARY_OUTPUT_CHANGED', item.value);
        };
      };

      const bindEvents = (scope) => {
        const onLogin = () => {
          initItems(scope).then(resetSelected);
        };
        events.on(EVENTS.LOGIN_SUCCESS, onLogin);
        scope.$on('$destroy', () => {
          events.off(EVENTS.LOGIN_SUCCESS, onLogin);
        });
      };
      const init = (scope) => {
        scope.isLoading = true;
        scope.primary = settingsService.getPrimaryOutput();
        scope.secondary = settingsService.getSecondaryOutput();

        augment(scope);
        initItems(scope).then(resetSelected); // config id is hardcoded

        setTimeout(() => {
          scope.primary && resetDropdown('primary', buildItem(scope.primary));
          scope.secondary &&
            resetDropdown('secondary', buildItem(scope.secondary));
        }, 0);

        bindEvents(scope);
      };
      return {
        restrict: 'EA',
        scope: {
          opts: '=',
        },
        link: {
          pre: init,
        },
        template: `
<a class="dropdown-button waves-effect waves-light" href="#" 
    data-dropdown="{activates: 'output-selection',
                    beloworigin: true, autoClose: false}">
    <span class="output-name">{{primary.name || '(Select Output)'}}</span>
    <span data-ng-if="secondary">&nbsp&nbsp│&nbsp&nbsp</span>
    <span data-ng-if="secondary" class="output-name">{{secondary.name}}</span>
    <span>&nbsp&nbsp</span>
    <span>
      <i svg-icon2="'arrowRight'" opts="{color: 'white'}"></i>
    </span>
</a>

<div class="dropdown-content" id="output-selection">
      <loading ng-show="isLoading"></loading>
      <form>
            <h4>Output Selection</h4>
            <!-- :::::::::::::::::: Primary Output :::::::::::::::::: -->
            <div class="input-field">
                <dropdown-select text="Please select"
                                 label="Primary output:"
                                 items="items"
                                 callback="callbackFactory('onPrimaryChange')"
                                 reset-factory="dropdownResetFactory('primary')"
                                 ></dropdown-select>
            </div>
            <!-- :::::::::::::::::: Secondary Output :::::::::::::::::: -->
            <h4>Variance</h4>
            <div class="input-field">
                <dropdown-select text="Please select"
                                 label="Secondary output:"
                                 items="items"
                                 callback="callbackFactory('onSecondaryChange')"
                               reset-factory="dropdownResetFactory('secondary')"
                                 ></dropdown-select>
            </div>
          </form>
  </div>
`,
      };
    },
  ]);
