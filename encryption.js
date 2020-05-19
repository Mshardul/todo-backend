var crypto = require('crypto');

module.exports.encrypt = function(text){
    let salt = 'd790123gtalqmg0701209d3feb5f230f';
    var hash = crypto.pbkdf2Sync(text, salt, 1000, 64, `sha512`).toString(`hex`);
    return hash;
}
