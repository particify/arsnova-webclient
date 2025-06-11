// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = async (config) => {
  const isDocker = await import('is-docker');
  config.set({
    basePath: '',
    browsers: ['ChromeHeadlessCustom'],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        flags: isDocker ? ['--no-sandbox'] : [],
      },
    },
    frameworks: ['jasmine', '@angular-devkit/build-angular', 'viewport'],
    viewport: {
      breakpoints: [
        {
          name: 'mobile',
          size: {
            width: 375,
            height: 667,
          },
        },
        {
          name: 'tablet',
          size: {
            width: 768,
            height: 1024,
          },
        },
        {
          name: 'desktop',
          size: {
            width: 1280,
            height: 800,
          },
        },
      ],
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-viewport'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true,
    },

    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
  });
};
