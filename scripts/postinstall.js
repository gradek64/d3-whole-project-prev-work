/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

const path = require('path');
const cp = require('child_process');
const fs = require('fs');

const fileExists = (file, cb) => {
  fs.stat(file, (err) => {
    if (err === null) {
      cb(true);
    } else if (err.code === 'ENOENT') {
      cb(false);
    } else {
      cb(err.code);
    }
  });
};

const ifNotExists = (file, cb) => {
  fileExists(file, (e) => {
    if (e === false) {
      cb();
    }
  });
};

const mklink = (source, target, cb) => {
  if (/^win/.test(process.platform)) {
    console.log(`MKLINK /J "${target}" "${source}"`);
    cp.exec(`MKLINK /J "${target}" "${source}"`, undefined, cb);
  } else {
    console.log(`ln -s ${source} ${target}`);
    cp.exec(`ln -s ${source} ${target}`, undefined, cb);
  }
};

const copy = (source, target, cb) => {
  let cbCalled = false;

  const rd = fs.createReadStream(source);
  rd.on('error', function(err) {
    done(err);
  });
  const wr = fs.createWriteStream(target);
  wr.on('error', function(err) {
    done(err);
  });
  wr.on('close', function() {
    done(null);
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
};

/* proceed */
const source = path.resolve(__dirname, '../', 'customized-vendors');
const target = path.resolve(__dirname, '../', 'node_modules',
    'customized-vendors');
// const bin = path.resolve(__dirname, '../', 'bin');
//
// ifNotExists(bin, () => {
//   console.log(`mkdir "${bin}"`);
//   fs.mkdir(bin, 0o777);
// });
ifNotExists(target, () => {
  mklink(source, target);
});

const sourcePreCommit = path.resolve(__dirname, 'pre-commit');
const targetPreCommit = path.resolve(__dirname, '../', '.git/hooks/pre-commit');
copy(sourcePreCommit, targetPreCommit, (err) => {
  if (err) throw err;
  console.log('copy scripts/pre-commit .git/hooks/pre-commit');
  console.log('chmod 0o755 .git/hooks/pre-commit');
  fs.chmod(targetPreCommit, 0o755);
});
