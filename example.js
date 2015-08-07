var pretty = require('js-object-pretty-print').pretty;
var validate = require('./lib/validate.js').validate;

validate(["test/sample/**", "test/sample_tmpls/**"]).then(function(data) {
	console.log('Result:');
	console.log(pretty(data));
}, function(err) {
	console.log('ERROR: ' + err);
});