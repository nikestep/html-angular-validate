'use strict';

var chai = require("chai");
var validate = require('../lib/validate.js');

var should = chai.should();
chai
	.use(require('chai-properties'))
	.use(require('chai-as-promised'));  // Must be last in the list!!

describe("Validate", function() {
	it("Reject no argument call", function() {
		return validate.validate().should.be.rejected;
	});

	it("Reject empty files array", function() {
		return validate.validate([]).should.be.rejected;
	});

	it("Reject files pattern that matches nothing", function() {
		return validate.validate(["test/nowhere/**"]).should.eventually.be.rejected;
	});

	it("Validate Correct Full Documents", function() {
		return validate.validate(["test/html/correct/**"]).should.eventually.have.properties({
			allpassed: true
		});
	});
});