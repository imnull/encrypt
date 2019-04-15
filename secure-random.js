module.exports = (function(){
    function Arcfour() {
        this.i = 0;
        this.j = 0;
        this.S = new Array();
    }

    // Initialize arcfour context from key, an array of ints, each from [0..255]
    function ARC4init(key) {
        var i, j, t;
        for (i = 0; i < 256; ++i)
            this.S[i] = i;
        j = 0;
        for (i = 0; i < 256; ++i) {
            j = (j + this.S[i] + key[i % key.length]) & 255;
            t = this.S[i];
            this.S[i] = this.S[j];
            this.S[j] = t;
        }
        this.i = 0;
        this.j = 0;
    }

    function ARC4next() {
        var t;
        this.i = (this.i + 1) & 255;
        this.j = (this.j + this.S[this.i]) & 255;
        t = this.S[this.i];
        this.S[this.i] = this.S[this.j];
        this.S[this.j] = t;
        return this.S[(t + this.S[this.i]) & 255];
    }

    Arcfour.prototype.init = ARC4init;
    Arcfour.prototype.next = ARC4next;

    // Plug in your RNG constructor here
    function prng_newstate() {
        return new Arcfour();
    }

    // Pool size must be a multiple of 4 and greater than 32.
    // An array of bytes the size of the pool will be passed to init()
    var rng_psize = 256;
    // Random number generator - requires a PRNG backend, e.g. prng4.js
    var rng_state;
    var rng_pool;
    var rng_pptr;

    // Initialize the pool with junk if needed.
    if (rng_pool == null) {
        rng_pool = new Array();
        rng_pptr = 0;
        var t;

    }

    function rng_get_byte() {
        if (rng_state == null) {
            rng_state = prng_newstate();
            // At this point, we may not have collected enough entropy.  If not, fall back to Math.random
            while (rng_pptr < rng_psize) {
                var random = Math.floor(65536 * Math.random());
                rng_pool[rng_pptr++] = random & 255;
            }
            rng_state.init(rng_pool);
            for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
                rng_pool[rng_pptr] = 0;
            rng_pptr = 0;
        }
        // TODO: allow reseeding after first request
        return rng_state.next();
    }

    function rng_get_bytes(ba) {
        var i;
        for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
    }

    function SecureRandom() {}
    SecureRandom.prototype.nextBytes = rng_get_bytes;

    return SecureRandom;
})()