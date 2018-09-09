/**
 * Created by Sergiu Ghenciu on 08/12/2017
 */

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
// const babel = require('gulp-babel');
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
// const commonjs = require('rollup-plugin-commonjs');
const stripCode = require('gulp-strip-code');
const sass = require('gulp-sass');
const KarmaServer = require('karma').Server;
const eslint = require('gulp-eslint');
const liveReload = require('livereload');
const tasks = require('gulp-task-listing');
const staticServer = require('./static-server.js');
const prettier = require('gulp-prettier-eslint');
const htmlPretty = require('gulp-html-prettify');
// const useref = require('gulp-useref');
// const gulpif = require('gulp-if');
// const uglify = require('gulp-uglify');
// const uglify = require('gulp-uglify-es').default;
// const rename = require('gulp-rename');
// const rev = require('gulp-rev');
// const revReplace = require('gulp-rev-replace');

const scanDir = (dir) =>
    fs.readdirSync(dir).reduce((files, file) =>
            fs.statSync(path.join(dir, file)).isDirectory() ?
                files.concat(scanDir(path.join(dir, file))) :
                files.concat(path.join(dir, file)),
        []);

const isNotVendor = (file) => file.indexOf('customized-vendors') === -1;

const is = (ext) => (file) => file.substr(file.length - ext.length) === ext;

const dirname = (file) => path.dirname(file);

const getDestination = (src) => {
  return dirname(src);
};


const mockPath = (path) => path.slice(4);

const nonMockPath = (path) => mockPath(path).replace('-mock', '');

const read = (file) => new Promise((resolve, reject) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

const write = (file) => (data) => new Promise((resolve, reject) => {
  fs.writeFile(file, data, 'utf8', (err) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

const prettifyJs = (file, destination) => {
  return gulp.src(file).
      pipe(prettier()).
      pipe(gulp.dest(destination));
};

const prettifyCss = (file, destination) => {
  return prettifyJs(file, destination);
};

const prettifyHtml = (file, destination) => {
  gulp.src(file).
      pipe(htmlPretty({
        indent_char: ' ',
        indent_size: 2,
        wrap_line_length: 80,
        max_preserve_newlines: 1,
      })).
      pipe(gulp.dest(destination));
};

const compileScss = (file, destination) => {
  return gulp.src(file).
      pipe(sass().on('error', sass.logError)).
      pipe(gulp.dest(destination));
};

const rollupJs = function(file, destination) {
  return rollup.rollup({
    input: file,
    plugins: [resolve({
      // jail: '/',
      // module: true,
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectory: dirname(file),
      },
    })],
  }).then((bundle) => {
    return bundle.write({
      file: destination,
      format: 'iife',
      name: 'd3',
      extend: false,
      interop: true,
      sourcemap: false,
    });
  });
};

// eslint-disable-next-line no-unused-vars
const copy = (file, destination, options) => {
  return gulp.src(file, options).pipe(gulp.dest(destination));
};

const stripDevBlocks = function(file, destination) {
  return gulp.src(file).pipe(stripCode({
    start_comment: 'start-dev-block',
    end_comment: 'end-dev-block',
    comment_all: true,
  })).pipe(gulp.dest(destination));
};

/* ------------------------------------------------------ */
/* ----------------------- Tasks ------------------------ */
/* ------------------------------------------------------ */
// gulp.task('combine', () => {
//   return gulp.src('src/index.html')
//   .pipe(useref())
//   .pipe(gulpif('*.js', uglify()))
//   .pipe(gulpif('*.js', rev()))
//   .pipe(revReplace())
//   .pipe(gulp.dest('dist'));
// });

// gulp.task("uglify", function () {
//   return gulp.src("dist/*.js")
//   .pipe(rename({suffix: ".min"}))
//   .pipe(uglify(/* options */))
//   .pipe(gulp.dest("dist"));
// });
//
// gulp.task('copy-pages', () => {
//   return copy(['src/**/*.html', '!src/index.html'], './dist');
// });
gulp.task('mock-on', () =>
  read('src/index.html')
  .then((html) =>
    scanDir('src/services')
    .filter(is('-mock.js'))
    .reduce((a, e) => a.replace(RegExp(nonMockPath(e), 'g'), mockPath(e)), html)
  )
  .then(write('src/index.html'))
);

gulp.task('mock-off', () =>
  read('src/index.html')
  .then((html) =>
    scanDir('src/services')
    .filter(is('-mock.js'))
    .reduce((a, e) => a.replace(RegExp(mockPath(e), 'g'), nonMockPath(e)), html)
  )
  .then(write('src/index.html'))
);

gulp.task('prettify-css', () => {
  return prettifyCss(['src/**/*.scss', '!customized-vendors'],
      './src');
});

gulp.task('prettify-html', () => {
  return prettifyHtml('src/**/*.html', './src');
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', '!customized-vendors']).
      pipe(eslint()).
      pipe(eslint.format()).
      pipe(eslint.failAfterError());
});

gulp.task('test', (done) => {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  }, done).start();
});

gulp.task('strip-dev-blocks', () => {
  return [
    stripDevBlocks('src/index.html', 'src'),
  ];
});

gulp.task('test-report', (done) => {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    reporters: ['junit', 'dots', 'progress', 'coverage'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-junit-reporter',
      'karma-coverage'],
    coverageReporter: {
      type: 'html',
      dir: 'test-coverage',
    },
    junitReporter: {
      outputDir: 'test-report',
      outputFile: 'unit.xml',
      suite: 'unit',
    },
  }, done).start();
});

gulp.task('compile-scss', () => {
  return scanDir('src').
      filter(isNotVendor).
      filter(is('.scss')).
      map((file) => compileScss(file, getDestination(file)));
});

gulp.task('prepare-vendors', () => {
  return [
    compileScss('customized-vendors/materialize-css/sass/materialize.scss',
        'customized-vendors/materialize-css/dist/css'),
    rollupJs('customized-vendors/d3/index-for-legacy.js',
        'customized-vendors/d3/build/d3.js'),
  ];
});

gulp.task('ng-config', (done) => {
  const envMap = {
    'test': {
      BASE_URL: 'https://test.amalytics.co',
    },
    'local': {
      BASE_URL: 'https://localhost',
    },
    'perf': {
      BASE_URL: 'https://perf.amalytics.co',
    },
    'dev': {
       BASE_URL: 'https://dev.amalytics.co',
    },
    'dev2': {
       BASE_URL: 'https://dev2.amalytics.co',
    },
    'preprod': {
      BASE_URL: 'https://preprod.amalytics.co',
    },
      'uat2': {
          BASE_URL: 'https://uat2.amalytics.co',
    },
    'staging': {
      BASE_URL: 'https://staging.amalytics.co',
    },
    'uat': {
      BASE_URL: 'https://uat.amalytics.co',
    },
    'rc1': {
      BASE_URL: 'https://rc1.amalytics.co',
    },
  };
  const template = (opts) =>
      `/**
 * Created by Sergiu Ghenciu on 18/12/2017
 */

'use strict';

angular.module('utils.env', []).constant('ENV', {
  BASE_URL: '${opts.BASE_URL}',
});
`;

  fs.writeFile('src/utils/env.js',
      template(envMap[(process.env.NODE_ENV || 'dev')]), done);
});

gulp.task('build',
    ['ng-config', 'prepare-vendors', 'strip-dev-blocks', 'compile-scss']);

gulp.task('serve', ['prepare-vendors', 'compile-scss'], () => {
  const server = staticServer(
      {expose: [{path: 'src'}, {path: 'customized-vendors'}]});
  const port = 8000;

  server.listen(port, () => {
    console.log(`Development server is listening on port ${port}`);
  });

  const liveReloadServer = liveReload.createServer();

  /* Watch scss */
  gulp.watch('src/**/*.scss', (file) => {
    // console.log('path:', getDestination(file.path));
    prettifyCss(file.path, getDestination(file.path));

    if (/_vars\.scss/.test(file.path)) {
      // ! on end event does not work
      gulp.start('compile-scss');
      setTimeout(() => {
        liveReloadServer.refresh(file.path);
      }, 100);
    } else {
      compileScss(file.path, getDestination(file.path)).on('end', () => {
        let fn = path.basename(file.path, '.scss');
        liveReloadServer.refresh(`${fn}.css`);
      });
    }
  });

  /* Watch js */
  gulp.watch(['src/**/*.js', '!src/**/*_test.js'], (file) => {
    prettifyJs(file.path, getDestination(file.path));
    liveReloadServer.refresh(file.path);
  });

  /* Watch html */
  gulp.watch('src/**/*.html', (file) => {
    prettifyHtml(file.path, getDestination(file.path));
    liveReloadServer.refresh(server.gerCurrentUrl().href);
  });
});

gulp.task('pre-commit', ['lint']);

gulp.task('default', () => tasks.withFilters(null, 'default')());
