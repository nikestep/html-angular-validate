var pretty = require('js-object-pretty-print').pretty;
var validate = require('./lib/validate.js').validate;

validate([
  "test/html/valid/full/*",
  "test/html/invalid/full/*"
], {
  customtags: ['custom-tag']
}).then(function(data) {
  console.log('Result:');
  console.log(pretty(data));
}, function(err) {
  console.log('ERROR: ' + err);
});
