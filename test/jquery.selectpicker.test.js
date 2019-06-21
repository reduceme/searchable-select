// var jQuery = require('../src/js/jquery.min');
var $sp = require('../src/js/jquery.selectpicker');
var expect = require('chai').expect;

describe('加法函数的测试', function() {
    it('1 加 1 应该等于 2', function() {
        expect($sp.test(1, 1)).to.be.equal(2);
    });
});
