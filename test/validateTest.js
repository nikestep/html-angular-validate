'use strict';

var chai = require('chai');
var validate = require('../lib/validate.js');

chai.should();
chai
  .use(require('chai-properties'))
  .use(require('chai-as-promised')); // Must be last in the list!!

describe('Validate', function() {
  this.timeout(5000);

  it('Reject no argument call', function() {
    return validate.validate().should.be.rejected;
  });

  it('Reject empty files array', function() {
    return validate.validate([]).should.be.rejected;
  });

  it('Reject files pattern that matches nothing', function() {
    return validate.validate(['test/nowhere/**']).should.eventually.be.rejected;
  });

  it('Correct Full Documents', function() {
    return validate.validate([
      'test/html/valid/full/valid_angular.html',
      'test/html/valid/full/valid_regular.html'
    ]).should.eventually.have.properties({
      allpassed: true,
      fileschecked: 2,
      filessucceeded: 2,
      filesfailed: 0,
      failed: []
    });
  });

  it('Correct Full Document with Custom Tag', function() {
    return validate.validate([
      'test/html/valid/full/valid_angular_custom.html'
    ], {
      customtags: ['custom-tag']
    }).should.eventually.have.properties({
      allpassed: true,
      fileschecked: 1,
      filessucceeded: 1,
      filesfailed: 0,
      failed: []
    });
  });

  it('Invalid Full Documents', function() {
    return validate.validate([
      'test/html/invalid/full/invalid_angular.html',
      'test/html/invalid/full/invalid_regular.html'
    ]).should.eventually.have.properties({
      allpassed: false,
      fileschecked: 2,
      filessucceeded: 0,
      filesfailed: 2,
      failed: [

        {
          'filepath': 'test/html/invalid/full/invalid_angular.html',
          'numerrs': 1,
          'errors': [{
            'col': 23,
            'line': 6,
            'msg': 'Attribute “n-app” not allowed on element “body” at this point.'
          }]
        }, {
          'filepath': 'test/html/invalid/full/invalid_regular.html',
          'numerrs': 2,
          'errors': [{
            'col': 16,
            'line': 1,
            'msg': 'Start tag seen without seeing a doctype first. Expected e.g. “<!DOCTYPE html>”.'
          }, {
            'col': 14,
            'line': 2,
            'msg': 'Element “head” is missing a required instance of child element “title”.'
          }]
        }
      ]
    });
  });

  it('Invalid Full Document Due to Custom Directive', function() {
    return validate.validate([
      'test/html/valid/full/valid_angular_custom.html'
    ]).should.eventually.have.properties({
      allpassed: false,
      fileschecked: 1,
      filessucceeded: 0,
      filesfailed: 1,
      failed: [

        {
          'filepath': 'test/html/valid/full/valid_angular_custom.html',
          'numerrs': 1,
          'errors': [{
            'col': 20,
            'line': 8,
            'msg': 'Element “custom-tag” not allowed as child of element “body” in this ' +
              'context. (Suppressing further errors from this subtree.)'
          }]
        }
      ]
    });
  });

  it('Correct Template Fragments', function() {
    return validate.validate([
      'test/html/valid/template/valid_angular.tmpl.html',
      'test/html/valid/template/valid_regular.tmpl.html'
    ], {
      wrapping: {
        'tr': '<table>{0}</table>'
      }
    }).should.eventually.have.properties({
      allpassed: true,
      fileschecked: 2,
      filessucceeded: 2,
      filesfailed: 0,
      failed: []
    });
  });

  it('Correct Template Fragment with Custom Tag', function() {
    return validate.validate([
      'test/html/valid/template/valid_angular_custom.tmpl.html'
    ], {
      customattrs: ['fixed-div-label']
    }).should.eventually.have.properties({
      allpassed: true,
      fileschecked: 1,
      filessucceeded: 1,
      filesfailed: 0,
      failed: []
    });
  });

  it('Correct Template Fragment Using Angular Bindings', function() {
    return validate.validate([
      'test/html/valid/template/valid_angular_bindings.tmpl.html'
    ]).should.eventually.have.properties({
      allpassed: true,
      fileschecked: 1,
      filessucceeded: 1,
      filesfailed: 0,
      failed: []
    });
  });

  it('Invalid Template Fragment with Improperly Closed Tag', function() {
    return validate.validate([
      'test/html/invalid/template/improperly_closed_tag.tmpl.html'
    ]).should.eventually.have.properties({
      allpassed: false,
      fileschecked: 1,
      filessucceeded: 0,
      filesfailed: 1,
      failed: [

        {
          'filepath': 'test/html/invalid/template/improperly_closed_tag.tmpl.html',
          'numerrs': 3,
          'errors': [{
            'col': 8,
            'line': 2,
            'msg': 'Self-closing syntax (“/>”) used on a non-void HTML element. Ignoring ' +
              'the slash and treating as a start tag.'
          }, {
            'col': 7,
            'line': 3,
            'msg': 'End tag for  “body” seen, but there were unclosed elements.'
          }, {
            'col': 8,
            'line': 2,
            'msg': 'Unclosed element “span”.'
          }]
        }
      ]
    });
  });

  it('Invalid Template Fragment with Improperly Nested Tags', function() {
    return validate.validate([
      'test/html/invalid/template/improperly_nested_tags.tmpl.html'
    ]).should.eventually.have.properties({
      allpassed: false,
      fileschecked: 1,
      filessucceeded: 0,
      filesfailed: 1,
      failed: [

        {
          'filepath': 'test/html/invalid/template/improperly_nested_tags.tmpl.html',
          'numerrs': 2,
          'errors': [{
            'col': 33,
            'line': 3,
            'msg': 'End tag “b” violates nesting rules.'
          }, {
            'col': 37,
            'line': 3,
            'msg': 'No “i” element in scope but a “i” end tag seen.'
          }]
        },
      ]
    });
  });

  it('Invalid Template Fragment with Missing Closing Tag', function() {
    return validate.validate([
      'test/html/invalid/template/missing_closing_tag.tmpl.html'
    ]).should.eventually.have.properties({
      allpassed: false,
      fileschecked: 1,
      filessucceeded: 0,
      filesfailed: 1,
      failed: [

        {
          'filepath': 'test/html/invalid/template/missing_closing_tag.tmpl.html',
          'numerrs': 2,
          'errors': [{
            'col': 7,
            'line': 5,
            'msg': 'End tag for  “body” seen, but there were unclosed elements.'
          }, {
            'col': 5,
            'line': 1,
            'msg': 'Unclosed element “div”.'
          }]
        },
      ]
    });
  });

  it('Invalid Template Fragment with Missing Template Extension', function() {
    return validate.validate([
      'test/html/invalid/template/template_missing_extension.html'
    ]).should.eventually.have.properties({
      allpassed: false,
      fileschecked: 1,
      filessucceeded: 0,
      filesfailed: 1,
      failed: [

        {
          'filepath': 'test/html/invalid/template/template_missing_extension.html',
          'numerrs': 2,
          'errors': [{
            'col': 50,
            'line': 1,
            'msg': 'Start tag seen without seeing a doctype first. Expected e.g. “<!DOCTYPE html>”.'
          }, {
            'col': 50,
            'line': 1,
            'msg': 'Element “head” is missing a required instance of child element “title”.'
          }]
        },
      ]
    });
  });
});
