/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

'use strict';

angular
  .module('utils.constants', [])
  .constant('CONSTANTS.EVENTS', {
    CLICK_ON_HAMBURGER_MENU: 'CLICK_ON_HAMBURGER_MENU',
    CLICK_ON_BELL: 'CLICK_ON_BELL',
    CLICK_ON_CREATE_COST_MODEL: 'CLICK_ON_CREATE_COST_MODEL',
    CONFIRM_DELETE_COST_MODEL: 'CONFIRM_DELETE_COST_MODEL',
    CLICK_ON_CANCEL_CREATE_COST_MODEL: 'CLICK_ON_CANCEL_CREATE_COST_MODEL',
    CLICK_ON_CANCEL_DELETE_COST_MODEL: 'CLICK_ON_CANCEL_DELETE_COST_MODEL',
    NEW_COST_MODEL_CREATED: 'NEW_COST_MODEL_CREATED',
    CONFIRM_DELETE_SUB_COSTPOT: 'CONFIRM_DELETE_SUB_COSTPOT',
    CONFIRM_DELETE_COSTPOT: 'CONFIRM_DELETE_COSTPOT',
    CONFIRM_UPDATE_COST_MODEL: 'CONFIRM_UPDATE_COST_MODEL',
    CLICK_ON_CANCEL_DELETE_SUB_COSTPOT: 'CLICK_ON_CANCEL_DELETE_SUB_COSTPOT',
    CLICK_ON_CANCEL_UPDATE_COST_MODEL: 'CLICK_ON_CANCEL_UPDATE_COST_MODEL',
    CLICK_ON_CANCEL_DELETE_COSTPOT: 'CLICK_ON_CANCEL_DELETE_COSTPOT',
    SUB_COSTPOT_DELETED: 'SUB_COSTPOT_DELETED',
    COSTPOT_DELETED: 'COSTPOT_DELETED',
    COST_MODEL_UPDATED: 'COST_MODEL_UPDATED' /* eslint-disable */,
    VALIDATE_COSTPOT_FILE: 'VALIDATE_COSTPOT_FILE',
    CLICK_ON_CANCEL_VALIDATE_COSTPOT_FILE:
      'CLICK_ON_CANCEL_VALIDATE_COSTPOT_FILE',
    COST_MODEL_DELETED: 'COST_MODEL_DELETED',
    CLICK_ON_CREATE_COSTPOT: 'CLICK_ON_CREATE_COSTPOT',
    CLICK_ON_CANCEL_CREATE_COSTPOT: 'CLICK_ON_CANCEL_CREATE_COSTPOT',
    NEW_COSTPOT_CREATED: 'NEW_COSTPOT_CREATED',
    CLICK_ON_UPLOAD_FILE: 'CLICK_ON_UPLOAD_FILE',
    CLICK_ON_CANCEL_UPLOAD_FILE: 'CLICK_ON_CANCEL_UPLOAD_FILE',
    FILE_UPLOADED: 'FILE_UPLOADED',
    FILE_UPDATED: 'FILE_UPDATED',
    FILE_DELETED: 'FILE_DELETED',
    CONFIRM_SET_FILE_ACTIVE: 'CONFIRM_SET_FILE_ACTIVE',
    CONFIRM_DELETE_FILE: 'CONFIRM_DELETE_FILE',
    CLICK_ON_CANCEL_SET_FILE_ACTIVE: 'CLICK_ON_CANCEL_SET_FILE_ACTIVE',
    CLICK_ON_CANCEL_DELETE_FILE: 'CLICK_ON_CANCEL_DELETE_FILE',
    CLICK_ON_CDM_MAPPING: 'CLICK_ON_CDM_MAPPING',
    CLICK_ON_CDM_MAPPING_RATIO: 'CLICK_ON_CDM_MAPPING_RATIO',
    CLICK_ON_CANCEL_CDM_MAPPING: 'CLICK_ON_CANCEL_CDM_MAPPING',
    CLICK_ON_CANCEL_CDM_MAPPING_RATIO: 'CLICK_ON_CANCEL_CDM_MAPPING_RATIO',

    CLICK_ON_CREATE_FILTER: 'CLICK_ON_CREATE_FILTER',
    CLICK_ON_CANCEL_CREATE_FILTER: 'CLICK_ON_CANCEL_CREATE_FILTER',
    FILTER_CREATED: 'FILTER_CREATED',

    CLICK_ON_CREATE_OUTPUT: 'CLICK_ON_CREATE_OUTPUT',
    CLICK_ON_CANCEL_CREATE_OUTPUT: 'CLICK_ON_CANCEL_CREATE_OUTPUT',
    OUTPUT_CREATED: 'OUTPUT_CREATED',
    CONFIRM_DELETE_OUTPUT: 'CONFIRM_DELETE_OUTPUT',
    CLICK_ON_CANCEL_DELETE_OUTPUT: 'CLICK_ON_CANCEL_DELETE_OUTPUT',
    OUTPUT_DELETED: 'OUTPUT_DELETED',
    CONFIRM_UPDATE_OUTPUT: 'CONFIRM_UPDATE_OUTPUT',
    CLICK_ON_CANCEL_UPDATE_OUTPUT: 'CLICK_ON_CANCEL_UPDATE_OUTPUT',
    OUTPUT_UPDATED: 'OUTPUT_UPDATED',

    CONFIRM_DELETE_USER: 'CONFIRM_DELETE_USER',
    CLICK_ON_CANCEL_DELETE_USER: 'CLICK_ON_CANCEL_DELETE_USER',
    USER_DELETED: 'USER_DELETED',

    CLICK_ON_CANCEL_DELETE_DATASET_FILTER:
      'CLICK_ON_CANCEL_DELETE_DATASET_FILTER',
    CONFIRM_DELETE_DATASET_FILTER: 'CONFIRM_DELETE_DATASET_FILTER',
    DATASET_FILTER_DELETED: 'DATASET_FILTER_DELETED',

    CLICK_ON_CREATE_USER: 'CLICK_ON_CREATE_USER',

    PRIMARY_OUTPUT_CHANGED: 'PRIMARY_OUTPUT_CHANGED',
    SECONDARY_OUTPUT_CHANGED: 'SECONDARY_OUTPUT_CHANGED',

    FILTERS_CHANGED: 'FILTERS_CHANGED',

    LOGIN_FORM_IS_READY: 'LOGIN_FORM_IS_READY',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
    NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
    NOT_AUTHORISED: 'NOT_AUTHORISED'
  })
  .constant('CONSTANTS.USER_ROLES', {
    ALL: '*',
    ADMIN: 'admin',
    EDITOR: 'editor',
    USER: 'user',
    GUEST: 'guest',
    USER_MANAGEMENT: 'USER_MANAGEMENT'
  })
  .constant('CONSTANTS.KEYS', {
    DOWN: 40,
    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    UP: 38,
    LEFT: 37,
    RIGHT: 39,
    TOP_0: 48,
    TOP_1: 49,
    TOP_2: 50,
    TOP_3: 51,
    TOP_4: 52,
    NUM_0: 96,
    NUM_1: 97,
    NUM_2: 98,
    NUM_3: 99,
    NUM_4: 100
  });
