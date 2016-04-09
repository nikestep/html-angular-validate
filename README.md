# html-angular-validate
[![Build Status](https://travis-ci.org/nikestep/html-angular-validate.svg?branch=master)](https://travis-ci.org/nikestep/html-angular-validate) [![Dependency Status](https://david-dm.org/nikestep/html-angular-validate.svg)](https://david-dm.org/nikestep/html-angular-validate) [![devDependency Status](https://david-dm.org/nikestep/html-angular-validate/dev-status.svg)](https://david-dm.org/nikestep/html-angular-validate#info=devDependencies)
[![npm Downloads Count](https://img.shields.io/npm/dm/html-angular-validate.svg)](https://github.com/nikestep/html-angular-validate)

> An HTML validator aimed at AngularJS projects.

While there are other node plugins that will validate HTML files, there are lacking a couple important features:

 * Support for AngularJS attributes and tags (both from AngularJS and custom created)
 * Support for templated/fragmented HTML files
 * Ability to concurrently validate files for greatly increased speed

This plugin looks to solve these problems and provide the value that comes with having HTML validation in the build chain.

Please note that this plugin works with the [w3cjs](https://github.com/thomasdavis/w3cjs) node plugin and will send files to be validated
against the W3C online validator tool. W3C asks that you be considerate of their free validator service and they will block your IP if
your traffic is deemed "excessive" by their servers. Such a block will automatically clear once the traffic subsides, but if your
project is large enough, you may need to run your own local W3C validator server. A guide for how to do this can be found
[here](https://github.com/tlvince/w3c-validator-guide). See the options below for pointing this plugin to a local validator service.

## Usage
This plugin is tested on node v4.0.0 and higher and is installed in the usual way:

```shell
npm install html-angular-validate --save
```

This plugin is written using promises. You will need to remember that the function's return value is the promise and not
the result of the validation. Handle that with a `then` structure:

```js
var validate = require('html-angular-validate');

validate.validate(
	["path/to/html/**", "path/to/templates/**"],
	{}
).then(function(result) {
	// Do something with the result object
}, function(err) {
	// Handle the error
});
```

The second parameter is an optional object that you can use to override the default options for the plugin. You can ommit it
and the plugin will run with all defaults.

## Result
When the promise resolves, an object will be returned that contains the findings of the validator. The object takes this form:

```js
{
	datetime: new Date(),  // Date/time of report
	allpassed: false,  // If all checked files passed
	fileschecked: 4,  // The number of files validated
	filessucceeded: 3,  // The number of files without errors
	filesfailed: 1,  // The number of files with validation errors
	failed: [  // An array where each entry is one of the files that failed validation
		{
			filepath: "path/to/file/with/problems.html",
			numerrs: 1,  // Number of validation errors found in file
			errors: [  // An array of the errors found in the file
				{
					msg: "Validation error from validator",
					line: 1,  // The line number the error occurred on (can be undefined)
					col: 1,  // The column number the error occurred on (can be undefined)
				}
			]
		}
	]
}
```

## Options

### angular
Type: `Boolean`
Default value: `true`

Turns on ignoring of validation errors that are caused by AngularJS.

### customtags
Type: `Array`
Default value: `[]`

List all of the custom tags you have created through directives and other means here. The validator will ignore warnings about these tags.

You can use the `'*'` wildcard, e.g.: `'custom-tags-*'`

### customattrs
Type: `Array`
Default value: `[]`

List all of the custom attributes you have created through directives and other means here. The validator will ignore warnings about
these attributes.

You can use the `*` wildcard, e.g.: `'custom-attrs-*'`

### wrapping
Type: `Object`
Default value: `{}`

Not all Angular templates start with tags that can be wrapped directly within the `<body>` tag. For templates like this, they first need
to be wrapped before the regular full-document wrapping that the plugin performs. As an example, a template for a row in a table might
look like this:

    <tr>
        <td>{name}</td>
        <td>{birthdate}</td>
        <td>{address}</td>
    </tr>

The entry into the `options.wrapping` plugin option would look like this:

    wrapping: {
        'tr': '<table>{0}</table>'
    }

The content of the template will be placed within the `{0}` and then the whole block will be wrapped like other templates. Note that the
name of the tag should not be wrapped with `<` and `>`.

### relaxerror
Type: `Array`
Default value: `[]`

List the error strings you want explicitly ignored by the validator.

### tmplext
Type: `String`
Default value: `tmpl.html`

The extension of HTML files that are templated or otherwise not complete and valid HTML files (i.e. do not start and end with `<html>`). The validator will wrap these files as complete HTML pages for validation.

### doctype
Type: `String`
Default value: `HTML5`

The doctype to use when validating HTML files. Set to `false` to have the validator auto-detect the doctype.

### charset
Type: `String`
Default value: `utf-8`

The charset to use when validating HTML files. Set to `false` to have the validator auto-detect the charset.

### reportpath
Type: `String`
Default value: `html-angular-validate-report.json`

The path to write a JSON report of validation and linting output to after completion. Set to `null` to not create this file.

### reportCheckstylePath
Type: `String`
Default value: `html-angular-validate-report-checkstyle.xml`

The path to write a checkstyle compatible xml report of validation and linting output to after completion. Set to `null` to not create this file.

### w3clocal
Type: `String`
Default value: `null`

Use this when running a local instance of the W3C validator service (e.g. `http://localhost:8080`). Do not use in conjunction with
`options.w3cproxy`.

### w3cproxy
Type: `String`
Default value: `null`

The proxy to the W3C validator service. Use this as an alternative when running a local instance of the W3C validator service
(e.g. `http://localhost:8080`). Do not use in conjunction with `options.w3clocal`.

### concurrentjobs
Type: `Integer`
Default value: `1`

The maximum number of validation jobs to run concurrently. Using a number greater than `1` can greatly increase validation speed
with many files, especially when running a local validation server.

This should only be used when you have your own validation server. W3C will shut you down much faster if you run concurrent
requests against them.

### maxvalidateattempts
Type: `Integer`
Default value: `3`

The maxinum number of attempts to validate a single file. Retries will be triggered if an error occurs during file validation and no
result is retrieved. This is not the same as validation completing and the result having errors. Instead the aim is to guard against
a flaky validator server.

## Longer Example
This is a longer example of using the plugin.

```js
var validate = require('html-angular-validate');

validate.validate([
	"views/***"
],
{
    tmplext: 'html.tmpl',
    customtags: [
        'top-nav',
        'left-bar',
        'right-bar',
        'client-footer'
    ],
    customattrs: [
        'fixed-width-box',
        'video-box'
    ],
    relaxerror: [
        'The frameborder attribute on the iframe element is obsolete. Use CSS instead.'
    ],
    reportpath: 'target/html-angular-validate-report.json'
}).then(function(result) {
	if (result.allpassed) {
		console.log('HTML validator passed all files');
	} else {
		console.log('HTML validator found errors for ' +
					result.filesfailed +
					' out of ' +
					result.fileschecked +
					' files total');

		for (var fileerr in result.failed) {
			console.log('  ' +
						fileerr.filepath +
						' has ' +
						fileerr.numerrs +
						' errors');
			for (var err in fileerr.errors) {
				console.log('    [' +
							err.line +
							':' +
							err.col +
							'] ' +
							err.msg);
			}
		}
	}
}, function(err) {
	console.log('HTML validator error: ' + err);
});
```

## Running the example script
Included in the repository is an example script that demonstrates how to use the plugin. This script is tied to the npm `start` script:

```shell
npm start
```

## Using Gulp
Included in the repository is a gulpfile that shows how you can build a gulp task using this module.

```shell
gulp
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add tests for any new or changed functionality.

Before submitting a pull request, please run the tests to make sure you did not break any existing functionality and that
your changes conform to the project style:

```shell
npm test
```

### Set up development environment

The only global you should have installed here is mocha:

```shell
npm install mocha --global
```

After that, simply install the required packages:

```shell
npm install
```

## Release History
 * 2016-04-09  v0.1.9  Merging #14, dependency updates, and supported Node version updates
 * 2016-03-12  v0.1.8  Merging #8 and #13 and dependency updates
 * 2015-11-09  v0.1.7  Fixing breakage in v0.1.6 release
 * 2015-11-09  v0.1.6  Merging #12 and code health fixes
 * 2015-10-31  v0.1.5  Merging #4 and #6
 * 2015-09-24  v0.1.4  Merging #3
 * 2015-08-28  v0.1.3  Fixing #2
 * 2015-08-11  v0.1.2  Fixing #1
 * 2015-08-09  v0.1.1  Removing colors dependency
 * 2015-08-09  v0.1.0  Initial release
