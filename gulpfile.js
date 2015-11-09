var gulp = require('gulp');
var gutil = require('gulp-util');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var stylish = require('gulp-jscs-stylish');
var validate = require('./lib/validate.js'); // change to require('html-angular-validate')

// Example task for using this module.
gulp.task('htmlangular', [], function(callback) {
  var colors = gutil.colors;
  var log = gutil.log;

  validate.validate([
    "test/html/invalid/full/invalid_regular.html",
    "test/html/valid/**"
  ], {
    customattrs: ['fixed-div-label'],
    customtags: ['custom-tag'],
    wrapping: {
      'tr': '<table>{0}</table>'
    }
  }).then(function(result) {
    if (result.allpassed) {
      log(colors.green('All files validated successfully'));
      callback();
    } else {
      log(colors.red('Found validation failures'));
      for (var i = 0; i < result.failed.length; i++) {
        var file = result.failed[i];
        log(colors.yellow(file.filepath));
        for (var j = 0; j < file.errors.length; j++) {
          var err = file.errors[j];
          if (err.line !== undefined) {
            log(colors.red('  --[' +
              err.line +
              ':' +
              err.col +
              '] ' +
              err.msg));
          } else {
            log(colors.red('  --[file] ' +
              err.msg));
          }

        }
      }
      callback(false);
    }
  }, function(err) {
    // Unable to validate files
    log(colors.red('htmlangular error: ' + err));
    callback(err);
  });
});

// Task to lint javascript files.
gulp.task('js-lint', function() {
  return gulp.src(['./lib/validate.js', './test/validateTest.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Task to style-check javascript files
gulp.task('js-style', function() {
  return gulp.src(['./lib/validate.js', './test/validateTest.js'])
    .pipe(jscs())
    .pipe(stylish());
});

gulp.task('default', ['htmlangular']);

gulp.task('code-health', ['js-lint', 'js-style']);
