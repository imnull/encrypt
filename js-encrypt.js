const { hex2b64 } = require('./utils');
const RSAKey = require('./rsa');

function JSEncrypt (options) {
    options = options || {};
    this.default_key_size = parseInt(options.default_key_size) || 1024;
    this.default_public_exponent = options.default_public_exponent || '010001'; //65537 default openssl public exponent for rsa key type
    this.log = options.log || false;
    // The private and public key.
    this.key = null;
};

JSEncrypt.prototype.setKey = function (key) {
    this.key = new RSAKey();
    this.key.parseKey(key);
};

JSEncrypt.prototype.setPublicKey = function (pubkey) {
    // Sets the public key.
    this.setKey(pubkey);
};

JSEncrypt.prototype.encrypt = function (string) {
    // Return the encrypted string.
    try {
        var res = this.getKey().encrypt(string);
        return hex2b64(res);
    } catch (ex) {
        return false;
    }
};

JSEncrypt.prototype.getKey = function () {
    // Only create new if it does not exist.
    if (!this.key) {
        // Get a new private key.
        this.key = new RSAKey();
        this.key.generate(this.default_key_size, this.default_public_exponent);
    }
    return this.key;
};

module.exports = JSEncrypt;