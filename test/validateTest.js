'use strict';

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var validate = require('../lib/validate.js');

chai.use(chaiAsPromised);
var expect = chai.expect();
var should = chai.should();

describe("Validate", function() {
	it("Validate Correct Full Documents", function() {
		validate.validate(["test/html/correct/**"]).then(function(result) {
			result.should.have.property("allpassed", true);
			result.should.have.property("filessucceeded", 1);
		}, function(err) {
			expect(true).to.equal(false);  // Fail the test
		});
	});
});