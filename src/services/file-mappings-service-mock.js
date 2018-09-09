/**
 * Created by Sergiu Ghenciu on 14/05/2018
 */

'use strict';

angular
  .module('services.file-mappings-service', ['utils.misc'])
  .factory('fileMappingsService', [
    'misc',
    '$q',
    function(_, $q) {
      const items = [
        {name: 'ITFBLevel1', api: '/itfb', id: 'itfb1Id'},
        {name: 'ITFBLevel2', api: '/itfb', id: 'itfb2Id'},
        {name: 'ITFBLevel3', api: '/itfb', id: 'itfb3Id'},
        {name: 'COST_POOL', api: '/mappings', id: 'costPoolMappingId'},
        {name: 'SERVICE_CODE', api: '/service-codes', id: 'serviceCodeId'},
        {
          name: 'COST_CATEGORY',
          api: '/cost-categories',
          id: 'costCategoryId',
        },
        {
          name: 'SOURCE_LEGAL_ENTITY',
          api: '/source-legal-entities',
          id: 'sourceLegalEntityId',
        },
        {
          name: 'SOURCE_COST_CENTRE',
          api: '/source-cost-centres',
          id: 'sourceCostCentreId',
        },
        {
          name: 'TARGET_LEGAL_ENTITY',
          api: '/target-legal-entities',
          id: 'targetLegalEntityId',
        },
        {
          name: 'TARGET_COST_CENTRE',
          api: '/target-cost-centres',
          id: 'targetCostCentreId',
        },
        {name: 'TARGET', api: '/targets', id: 'targetsId'},
        {name: 'VENDOR', api: '/vendors', id: 'vendorId'},
        {name: 'ROLE', api: '/roles', id: 'roleId'},
        {name: 'SERVICE_TYPE', api: '/service-types', id: 'serviceTypeId'},
        {name: 'SERVICE_GROUP', api: '/service-groups', id: 'serviceGroupId'},
        {name: 'SERVICE', api: '/services', id: 'serviceId'},
        {name: 'LEVELS', api: '/levels', id: 'levelId'},
        {name: 'NOMINALS', api: '/nominals', id: 'nominalId'},
        {name: 'COST_POTS', api: '/costpots', id: 'costPotId'},
        {name: 'COST', api: '/costs', id: 'costId'},
        {name: 'CONTRACT', api: '/contracts', id: 'contractId'},
        {name: 'LABOUR', api: '/labours', id: 'labourId'},
        {name: 'RECOVERY', api: '/recoveries', id: 'recoveryId'},
        {name: 'GENERIC', api: '/generics', id: 'genericId'},
        {name: 'DATA_CENTRE', api: '/data-centres', id: 'dataCentreId'},
        {name: 'RATIO', api: '/ratios', id: 'ratioId'},
        {name: 'NETWORK', api: '/networks', id: 'networkId'},
        {name: 'MAKE', api: '/makes', id: 'makeId'},
        {name: 'MODEL', api: '/models', id: 'modelId'},
        {name: 'STORAGE', api: '/storage', id: 'storageId'},
        {
          name: 'PHYSICAL_SERVER',
          api: '/physical-servers',
          id: 'physicalserverId',
        },
        {
          name: 'VIRTUAL_SERVER',
          api: '/virtual-servers',
          id: 'virtualserverId',
        },
      ];
      const getAll = (fileTypeId, params, excludeCommon) =>
        $q((resolve) => {
          resolve({data: items});
        });

      return {
        getAll,
      };
    },
  ]);
