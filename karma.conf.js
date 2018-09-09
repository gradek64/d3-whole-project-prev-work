module.exports = function(config) {
  config.set({

    basePath: './',

    files: [
      'customized-vendors/angular/angular.js',
      'customized-vendors/angular-route/angular-route.js',
      'customized-vendors/angular-mocks/angular-mocks.js',
      'customized-vendors/modal/modal.js',
      'src/app.js',
      'src/pages/**/*.js',
      'src/components/**/*.js',
      'src/utils/*.js',
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
    ],
  });
};
