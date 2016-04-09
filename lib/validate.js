/*
 * html-angular-validate
 * https://github.com/nikestep/html-angular-validate
 *
 * Copyright (c) 2015 Nik Estep
 * Licensed under the MIT license.
 */
'use strict';

// Load our dependencies
var async = require('async');
var extend = require('node.extend');
var filendir = require('filendir');
var fs = require('fs');
var globule = require('globule');
var Promise = require('promise');
var tmp = require('temporary');
var w3cjs = require('w3cjs');
var xmlbuilder = require('xmlbuilder');

require('string.prototype.endswith');

// Set the default options
var defaultOpts = {
  angular: true,
  customtags: [],
  customattrs: [],
  wrapping: {},
  relaxerror: [],
  tmplext: 'tmpl.html',
  doctype: 'HTML5',
  charset: 'utf-8',
  reportpath: 'html-angular-validate-report.json',
  reportCheckstylePath: 'html-angular-validate-report-checkstyle.xml',
  reportCheckstyleVersion: 6.9,
  reportCheckstyleSeverity: 'error',
  w3clocal: null,
  w3cproxy: null,
  concurrentjobs: 1,
  maxvalidateattempts: 3
};

var checkRelaxed = function(errmsg, options) {
  for (var i = 0; i < options.relaxerror.length; i += 1) {
    if (errmsg.indexOf(options.relaxerror[i]) !== -1) {
      return true;
    }
  }
  return false;
};

var checkAngularBindings = function(err, options) {
  if (options.angular) {
    if ((err.message === 'Empty heading.' && /\sng-bind(-html)?=/.test(err.extract)) ||
      (/^Element “.+” is missing required attribute “src”/.test(err.message) && /\sng-src=/.test(err.extract))) {
      return true;
    }
  }
  return false;
};

var checkCustomTags = function(errmsg, options) {
  for (var i = 0; i < options.customtags.length; i += 1) {
    var re = new RegExp('^Element (.?)' +
      options.customtags[i] +
      '(.?) not allowed as child (.*)');
    if (re.test(errmsg)) {
      return true;
    }
  }
  return false;
};

var checkCustomAttrs = function(errmsg, options) {
  for (var i = 0; i < options.customattrs.length; i += 1) {
    var re = new RegExp('Attribute (.?)' +
      options.customattrs[i] +
      '(.?) not allowed on element (.*) at this point.');
    if (re.test(errmsg)) {
      return true;
    }
  }
  return false;
};

var validate = function(file, callback) {
  var options = this;
  var temppath = file.path;

  // If this is a templated file, we need to wrap it as a full
  // document in a temporary file
  var tfile = null;
  if (file.istmpl) {
    // Create a temporary file
    tfile = new tmp.File();

    // Store temp path as one to pass to validator
    temppath = tfile.path;

    // Create a wrapped file to pass to the validator
    var content = fs.readFileSync(file.path, {
      encoding: 'utf8'
    }).trim();
    for (var key in options.wrapping) {
      if (options.wrapping.hasOwnProperty(key)) {
        var tag = '^<' + key + '[^>]*>';
        if (content.match(tag)) {
          content = options.wrapping[key].replace('{0}', content);
          break;
        }
      }
    }

    // Build temporary file
    var metaCharset = (options.charset !== false) ?
      '<meta content="text/html;charset=' + options.charset + '" http-equiv="Content-Type">' : '';
    fs.writeFileSync(temppath,
      '<!DOCTYPE html>\n' +
      '<html>\n' +
      '<head>' +
      metaCharset +
      '<title>Dummy</title>' +
      '</head>\n' +
      '<body>\n' +
      content + '\n' +
      '</body>\n</html>');
  }

  // Do validation
  w3cjs.validate({
    file: temppath,
    output: 'json',
    doctype: this.doctype,
    charset: this.charset,
    proxy: this.w3cproxy,
    callback: function(res) {
      // Validate result
      if (res === undefined || res.messages === undefined) {
        // Something went wrong
        //   See if we should try again or fail this file and
        //   move on
        if (file.attempts < options.maxvalidateattempts) {
          // Increment the attempt count and try again
          file.attempts += 1;
          validate(file, callback);
        } else {
          // Fail the file and stop remaining validations
          // Clean up if it is a template file
          file.seenerrs = true;
          file.errs = [{
            line: 0,
            col: 0,
            msg: 'Unable to validate file'
          }];
          if (tfile !== null) {
            tfile.unlink();
          }
          callback('Unable to check file', file);
        }
      } else {
        // Handle results
        var errFound = false;
        for (var i = 0; i < res.messages.length; i += 1) {
          // See if this error message is valid
          if (!checkRelaxed(res.messages[i].message, options) &&
            !checkAngularBindings(res.messages[i], options) &&
            !checkCustomTags(res.messages[i].message, options) &&
            !checkCustomAttrs(res.messages[i].message, options)) {
            // Store the error message
            errFound = true;
            file.seenerrs = true;
            file.errs.push({
              line: (file.istmpl) ? res.messages[i].lastLine - 4 : res.messages[i].lastLine,
              col: res.messages[i].lastColumn,
              msg: res.messages[i].message
            });
          }
        }

        // Clean up temporary file if needed
        if (tfile !== null) {
          tfile.unlink();
        }

        // Callback: no halting error, success indicator
        callback(null, file);
      }
    }
  });
};

var finished = function(files, options, fullfill) {
  // Get the failed files
  var failedFiles = files.filter(function(file) {
    return file.seenerrs;
  });

  // Build the result object
  var result = {
    datetime: new Date(),
    allpassed: failedFiles.length === 0,
    fileschecked: files.length,
    filessucceeded: files.length - failedFiles.length,
    filesfailed: failedFiles.length,
    failed: failedFiles.map(function(file) {
      return {
        filepath: file.path,
        numerrs: file.errs.length,
        errors: file.errs.map(function(err) {
          var out = {
            msg: err.msg
          };
          if (err.line !== undefined) {
            out.line = err.line;
            out.col = err.col;
          }
          return out;
        })
      };
    })
  };

  // Output report if necessary
  if (options.reportpath !== null) {
    // Write the report out
    filendir.writeFileSync(options.reportpath, JSON.stringify(result));
  }

  //Output report XML if necessary
  if (options.reportCheckstylePath !== null) {
    // Write the report out
    filendir.writeFileSync(options.reportCheckstylePath, writeCheckstyleReport(files,options));
  }

  // Send result to promise
  fullfill(result);
};

var writeCheckstyleReport = function(files, options) {
  // extend here special char handling, if not already done by xmlbuilder
  var root = xmlbuilder.create('checkstyle', {
    stringify: {
      attValue: function(str) {
        return String(str).replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/!/g, '&#33;')
                    .replace(/\"/g, '&quot;')
                    .replace(/\u201c/g, '&#8220;')
                    .replace(/\u201d/g, '&#8221;');
      }
    }
  })
  .att('encoding', 'UTF-8')
  .att('version', options.reportCheckstyleVersion);

  // iterate over the files
  for (var i = 0; i < files.length; i += 1) {
    var file = files[i];
    var fullFilePath = (process.cwd() + '/' + file.path).replace(/\//g, '/');
    var fileNode = root.ele('file')
       .att('name', fullFilePath);

    // iterate over the issues
    for (var j = 0; j < file.errs.length; j += 1) {
      var err = file.errs[j];

      var xmlMessage = err.msg;

      fileNode.ele('error')
        .att('line', err.line)
        .att('col', err.col)
        .att('severity', options.reportCheckstyleSeverity)
        .att('source', 'html-angular-validate')
        .att('message', xmlMessage);
    }
  }

  var xmlString = root.end({pretty: true, indent: '   ', newline: '\n'});
  return xmlString;
};

module.exports = {
  validate: function(fileSrcs, opts) {
    if (opts !== undefined) {
      opts = JSON.parse(JSON.stringify(opts));
    }

    // Wrap inside a promise object
    return new Promise(function(fullfill, reject) {
      // Merge options
      var options = extend(JSON.parse(JSON.stringify(defaultOpts)), opts);

      // Parse wildcard '*' to RegExp '(.*)'
      ['customtags', 'customattrs'].forEach(function(prop) {
        for (var i = 0; i < options[prop].length; i += 1) {
          options[prop][i] = options[prop][i].replace(/\*/g, '(.*)');
        }
      });

      // Add attributes to ignore if this is for AngularJS
      if (options.angular) {
        options.customtags.push('ng-(.*)');
        options.customtags.push('ui-(.*)');
        options.customattrs.push('ng-(.*)');
        options.customattrs.push('ui-(.*)');
        options.customattrs.push('on');
      }

      // Ignore certain default warnings
      options.relaxerror.push('The Content-Type was');
      options.relaxerror.push('The character encoding was not declared');
      options.relaxerror.push('Using the schema for HTML with');
      options.relaxerror.push('Using the schema for HTML5 +');

      // Delete an exist report if present
      if (options.reportpath !== null && fs.existsSync(options.reportpath)) {
        fs.unlinkSync(options.reportpath);
      }

      // Pass along local w3c server if set
      if (options.w3clocal !== null) {
        w3cjs.setW3cCheckUrl(options.w3clocal);
      }

      // Get a list of files to validate
      var files = globule.find({
        src: fileSrcs,
        filter: 'isFile'
      }).map(function(file) {
        return {
          path: file,
          istmpl: file.endsWith(options.tmplext),
          attempts: 0,
          seenerrs: false,
          errs: []
        };
      });

      // Check that we got files
      if (files.length === 0) {
        reject('No files found to match');
      }

      // Start the validation
      async.mapLimit(
        files,
        options.concurrentjobs,
        validate.bind(options),
        function(err, results) {
          finished(results, options, fullfill, reject);
        });
    });
  }
};
