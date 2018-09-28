(function() {
    var blas = {};
    cscheid.blas = blas;

    // BLAS-like basic linear algebra stuff

    //////////////////////////////////////////////////////////////////////////
    // level 1 blas
    // 
    // FIXME: all of this is assuming inc* = 1
    
    function scal(alpha, x) {
        var n = x.length;
        for (var i=0; i<n; ++i) {
            x[i] *= alpha;
        }
    }
    blas.scal = scal;

    function copy(x, y) {
        var n = x.length;
        for (var i=0; i<n; ++i) {
            y[i] = x[i];
        }
    }
    blas.copy = copy;

    function axpy(alpha, x, y) {
        var n = x.length;
        for (var i=0; i<n; ++i) {
            y[i] = alpha * x[i] + y[i];
        }
    }
    blas.axpy = axpy;

    function dot(x, y) {
        var n = x.length;
        var r = 0;
        for (var i=0; i<n; ++i) {
            r += x[i] * y[i];
        }
        return r;
    }
    blas.dot = dot;
})();
