var assert = require('assert');

function add() {
    return Array.prototype.slice.call(arguments).reduce(function(prev, curr) {
        return prev + curr;
    }, 0);
}

describe('add()', function() {
    var tests = [
        {args: [1, 2],       expected: 3},
        {args: [1, 2, 3],    expected: 6},
        {args: [1, 2, 3, 4], expected: 10}
    ];

    tests.forEach(function(test) {
        it('correctly adds ' + test.args.length + ' args', function() {
            var res = add.apply(null, test.args);
            assert.equal(res, test.expected);
        });
    });
});

describe('Array', function(){
    before(function(){
        // ...
    });

    describe('#indexOf()', function(){
        context('when not present', function(){
            it('should not throw an error', function(){
                (function(){
                    [1,2,3].indexOf(4);
                }).should.not.throw();
            });
            it('should return -1', function(){
                [1,2,3].indexOf(4).should.equal(-1);
            });
        });
        context('when present', function(){
            it('should return the index where the element first appears in the array', function(){
                [1,2,3].indexOf(3).should.equal(2);
            });
        });
    });
});
