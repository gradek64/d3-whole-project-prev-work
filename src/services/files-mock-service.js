/**
 * Created by Sergiu Ghenciu on 16/01/2018
 */

'use strict';

angular
  .module('services.files-mock-service', [
    'services.api-service',
    'services.file-types-service',
    'services.resource-type-service',
    'services.resource-type-mock-service',
    'utils.misc',
  ])
  .factory('filesMockService', [
    'apiService',
    'fileTypesService',
    'resourceTypeService',
    'resourceTypeMockService',
    'misc',
    '$httpParamSerializer',
    '$q',
    function(
      api,
      fileTypesService,
      resourceTypeService,
      resourceTypeMockService,
      _,
      $httpParamSerializer,
      $q
    ) {
      /* the `input` is the `tableState` of smart-table module */
      const mapParams = ({pagination = {}, sort = {}, search} = {}) => {
        if (pagination.start === undefined) {
          pagination.start = 0;
        }
        if (pagination.number === undefined) {
          pagination.number = 200;
        }
        const config = {};
        config.headers = {};
        config.headers['x-amalytics-range'] =
          pagination.start + '-' + (pagination.start + pagination.number);
        // config.headers['x-amalytics-range'] = '0-6';
        if (sort.predicate) {
          config.headers['x-amalytics-sort'] = sort.predicate;
          config.headers['x-amalytics-sort-direction'] = sort.reverse
            ? 'DESC'
            : 'ASC';
        }

        return config;
      };

      const files = [
        {
          id: 14,
          fileTypeId: 42,
          costPotId: 44,
          fileName: 'ServicesNormal.csv',
          status: 'CONFIGURED',
          active: true,
          sourceType: 'CSV',
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T14:59:53.611Z',
        },
        {
          id: 15,
          fileTypeId: 43,
          costPotId: 44,
          fileName: 'ServicesNormal.csv',
          status: 'CONFIGURED',
          active: true,
          sourceType: 'CSV',
          createdBy: 'rc1@amalytics.co',
          creationDate: '2018-06-22T14:59:53.611Z',
        },
      ];

      const responseMiddleware = (res) => {
        return {
          data: res.data || [],
        };
      };

      const concat = (res) => {
        console.log('res.map((e) => e.data)', res.map((e) => e.data));
        return {data: _.flatten(res.map((e) => e.data))};
      };

      const addFileTypeName = (fileType) => (res) => {
        res.data.forEach((e) => (e.fileTypeName = fileType.name));
        return res;
      };

      const getFilesFactory = (params) => (fileType) => {
        /* return api
          .get(
            '/configuration-srv/v2/filetypes/' + fileType.id + '/files',
            mapParams(params)
          )
          .then(responseMiddleware)
          .then(addFileTypeName(fileType));*/
        return new Promise((resolve, reject) => {
          resolve({data: files});
        });
      };

      const addFileTypeNameByID = (fileTypes) => (res) => {
        console.log('file response', res);
        console.log('fileTypes', fileTypes);
        /* res.data.forEach((file) => {
          // prettier-ignore
          const fileType = fileTypes
          .find((type) => type.id === file.fileTypeId);
          file.fileTypeName = fileType.name;
        });*/
        return res;
      };

      const getAll = (fileTypes, params, costpotId) => {
        console.log('fileTypes', fileTypes);
        console.log('params', params);
        console.log('costpotId', costpotId);
        costpotId = undefined;
        if (_.def(costpotId)) {
          return api
            .get(
              '/configuration-srv/v2/costpots/' + costpotId + '/files',
              mapParams(params)
            )
            .then(responseMiddleware)
            .then(addFileTypeNameByID(fileTypes));
        }
        return $q.all(fileTypes.map(getFilesFactory(params))).then(concat);
      };

      const getFileTypesFactory = (params) => (resourceType) =>
        resourceTypeMockService.getAll(resourceType.id, params);

      const getOne = (id, params, configId) =>
        // resourceTypeService
        resourceTypeMockService
          .getAll(configId, params)
          .then((res) =>
            $q.all(res.data.map(getFileTypesFactory(params))).then(concat)
          )
          .then((res) => res.data)
          .then((fileTypes) => getAll(fileTypes, params))
          .then((res) => {
            return res.data.find((e) => e.id === parseInt(id));
          });

      const generateBoundary = () => {
        return 'AJAX-----------------------' + new Date().getTime();
      };

      const readFile = (file) => {
        return $q((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener(
            'load',
            function() {
              resolve(reader.result);
            },
            false
          );
          // reader.readAsBinaryString(file); // non-standard
          reader.readAsText(file);
        });
      };

      const update = (fileTypeId, fileId, doc) => {
        return api.patch(
          '/configuration-srv/v2/filetypes/' + fileTypeId + '/files/' + fileId,
          doc
        );
      };

      const download = (file, params) => {
        return api
          .get(
            '/configuration-srv/v2/filetypes/' +
              file.fileTypeId +
              '/files/' +
              file.id +
              '/download?' +
              $httpParamSerializer(params)
          )
          .then((res) => {
            _.download(res.data, file.fileName);
            return res;
          });
      };

      const del = (fileTypeId, fileId) => {
        return api.delete(
          '/configuration-srv/v2/filetypes/' + fileTypeId + '/files/' + fileId
        );
      };

      const getErrors = (fileId, params, fileTypeId) => {
        return api.get(
          '/configuration-srv/v2/filetypes/' +
            fileTypeId +
            /files/ +
            fileId +
            '/errors',
          mapParams(params)
        );
      };

      const buildMessage = (files, boundary) => {
        const CRLF = '\r\n';
        const fieldName = 'file';

        return $q.all(files.map(readFile)).then((res) => {
          const parts = res.map((fileStr, index) => {
            let part = '';
            /*
                 * Content-Disposition header contains name of the field
                 * used to upload the file and also the name of the file as
                 * it was on the user's computer.
                 */
            part += 'Content-Disposition: form-data; ';
            part += 'name="' + fieldName + '"; ';
            part += 'filename="' + files[index].name + '"' + CRLF;

            /*
               * Content-Type header contains the mime-type of the file
               * to send. Although we could build a map of mime-types
               * that match certain file extensions, we'll take the easy
               * approach and send a general binary header:
               * application/octet-stream
               */
            // part += 'Content-Type: application/octet-stream';
            part += 'Content-Type: ' + files[index].type;
            part += CRLF + CRLF; // marks end of the headers part

            /*
               * File contents read as binary data, obviously
               */
            part += fileStr + CRLF;

            return part;
          });

          let message = '--' + boundary + CRLF;
          message += parts.join('--' + boundary + CRLF);
          message += '--' + boundary + '--' + CRLF;

          return message;
        });
      };

      const upload = (fileTypeId, files, costPotId) => {
        const boundary = generateBoundary();
        // const contentType = undefined;
        //
        // let fd = new FormData();
        // fd.append('file', files[0]);
        // fd.append('name', files[0].name);
        //
        // return api.post(
        //     '/configuration-srv/v2/filetypes/' + fileTypeId + '/files',
        //     fd,
        //     {headers: {'Content-Type': contentType}}).then((res) => {
        //   return res;
        // });
        const contentType = 'multipart/form-data; boundary=' + boundary;
        return buildMessage(files, boundary).then((message) => {
          return api
            .post(
              '/configuration-srv/v2/filetypes/' +
                fileTypeId +
                /costpots/ +
                costPotId +
                '/files',
              message,
              {headers: {'Content-Type': contentType}}
            )
            .then((res) => {
              return res;
            });
        });
      };

      return {
        getAll,
        upload,
        update,
        delete: del,
        download,
        getOne,
        getErrors,
      };
    },
  ]);
