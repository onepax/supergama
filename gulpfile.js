var del = require("del"),
    fs = require("fs"),
    gulp = require("gulp"),
    gulpCustomVariables = require("./custom_node_modules/gulp-custom-variables"),
    gulpFilter = require("gulp-filter"),
    gulpConcat = require("gulp-concat"),
    gulpRename = require("gulp-rename"),
    gulpConcat = require('gulp-concat'),
    gulpWrap = require('gulp-wrap'),
    pcss = require('gulp-postcss'),
    pcssVariables = require('postcss-css-variables'),
    pcssImport = require("postcss-import"),
    pcssPresetEnv = require('postcss-preset-env'),
    pcssMixins = require('postcss-mixins'),
    pcssNesting = require("postcss-nesting"),
    pcssColor = require("postcss-color-function"),
    pcssCustomMedia = require('postcss-custom-media'),
    pcssCSSO = require('postcss-csso'),
    cssMediaGroup = require('css-mqgroup'),
    sortCSSmq = require('sort-css-media-queries'),
    gulpJSUglify = require('gulp-uglify'),
    gulpJSObfuscator = require('gulp-javascript-obfuscator');

var paths = {
  server: {
    js: {
      src: "./server/src/**/*.js",
      watch: "./server/src/**/*.js",
      base: "./server/src/",
      dest: "./server/build",
    }
  },
  site: {
    css: {
      src: "./site/src/pcss/export/**/*.pcss",
      watch: "./site/src/pcss/**/*.pcss",
      base: "./site/src/pcss/",
      dest: "./site/web/css",
    },
    js: {
      src: [
          "./site/src/js/plugins/**/*.js",
          "./site/src/js/libs/**/*.js",
          "./site/src/js/*.js",
      ],
      watch: "./site/src/**/*.js",
      base: "./site/src/js/",
      dest: "./site/web/js/",
    }
  }
};

var arg = (argList => {
  var arg = {}, a, opt, thisOpt, curOpt;
  for (a = 0; a < argList.length; a++) {
    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {
      if (curOpt) arg[curOpt] = opt;
      curOpt = null;

    }
    else {
      curOpt = opt;
      arg[curOpt] = true;
    }
  }
  return arg;
})(process.argv);

var env = 'dev';
if (typeof arg.env !== 'undefined' && arg.env === 'prod') {
  env = 'prod';
}
var config = (JSON.parse(fs.readFileSync('./config.json', 'utf8')))[env];

gulp.task('clean', function(){
  return del([
    "./server/build/**",
    "./site/web/css/**",
    "./site/web/js/**",
  ], {
    force: true,
  });
});

gulp.task('server-js', function () {
  return gulp
      .src(paths.server.js.src)
      .pipe(gulpCustomVariables(config))
      .pipe(gulp.dest(paths.server.js.dest));
});

gulp.task('server-js-watch', function () {
  gulp.watch(paths.server.js.watch, gulp.series('server-js'));
});

gulp.task('site-css', function () {
  return gulp
      .src(paths.site.css.src)
      .pipe(pcss([
        pcssImport(),
        pcssMixins(),
        pcssNesting(),
        pcssVariables(),
        pcssCustomMedia(),
        pcssColor(),
        pcssPresetEnv({
          autoprefixer: [
            'last 10 versions',
            'ie >= 11',
          ],
          features: {
            'custom-properties': {
              preserve: false
            }
          },
        }),
        // cssMediaGroup({
        //   sort: sortCSSmq
        // }),
        // pcssCSSO(),
      ]))
      .pipe(gulpRename({
        extname: ".css"
      }))
      .pipe(gulp.dest(paths.site.css.dest));
});

gulp.task('site-css-watch', function () {
  gulp.watch(paths.site.css.watch, gulp.series('site-css'));
});

gulp.task('site-js', function () {

  var filterPlugins = gulpFilter(['**','!**/plugins/**/*.js'], {
    restore: true
  });

  return gulp
      .src(paths.site.js.src,  {
        base: paths.site.js.base
      })

      .pipe(filterPlugins)
      .pipe(gulpCustomVariables(config))
      // .pipe(gulpJSObfuscator({
      //   compact: true
      // }))
      .pipe(filterPlugins.restore)

      .pipe(gulpConcat('app.js'))
      .pipe(gulpWrap('(function(){<%= contents %>})();'))
      // .pipe(gulpJSUglify())

      .pipe(gulp.dest(paths.site.js.dest));
});

gulp.task('site-js-watch', function () {
  gulp.watch(paths.site.js.watch, gulp.series('site-js'));
});

gulp.task('all', gulp.series('clean', gulp.parallel('server-js','site-css','site-js')));
gulp.task('watch', gulp.series('all', gulp.parallel('server-js-watch','site-css-watch','site-js-watch')));
