/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const find = (dirs, urlPathname, cb) => {
  for (let i = 0; i < dirs.length; i++) {
    const f = path.join(dirs[i].path, urlPathname);
    if (fs.existsSync(f)) {
      cb(f);
      return;
    }
  }
  cb(null);
};

module.exports = ({expose = [{path: './'}], index = 'index.html'} = {}) => {
  const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
  };
  const dirs = expose.map((e) => {
    return {path: path.resolve(e.path)};
  });
  let currentUrl = {pathname: path.join(dirs[0].path + '/' + index)};

  const listen = (port, cb) => {
    http.createServer(function(req, res) {
      console.log(`${req.method} ${req.url}`);

      const parsedUrl = url.parse(req.url);

      find(dirs, parsedUrl.pathname, function(file) {
        if (file === null) {
          res.statusCode = 404;
          res.end(`File ${parsedUrl.pathname} not found!`);
          return;
        }

        if (fs.statSync(file).isDirectory()) {
          if (file.substr(-1) !== '/') {
            file += '/';
          }
          file += index;
        }

        fs.readFile(file, function(err, data) {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            const ext = path.parse(file).ext;
            res.setHeader('Content-type', map[ext] || 'text/plain');
            res.end(data);

            if (ext === '.html') {
              currentUrl = parsedUrl;
              currentUrl.pathname = file;
            }
          }
        });
      });
    }).listen(port, cb);
  };

  const gerCurrentUrl = () => currentUrl;

  return {
    listen,
    gerCurrentUrl,
  };
};
