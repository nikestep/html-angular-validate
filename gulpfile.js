var gulp = require('gulp');
var gutil = require('gulp-util');
var validate = require('./lib/validate.js');

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

gulp.task('default', ['htmlangular']);