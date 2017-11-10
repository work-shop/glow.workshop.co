'use strict';

var md5 = require('md5');

function saltOrder( s1, s2 ) {
    return ( s1 >= s2 ) ? [s1, s2] : [s2, s1];
}

var GlowNodeKey = function( key, salt ) {
    if (!(this instanceof GlowNodeKey)) { return new GlowNodeKey( key, salt  ); }
    var self = this;

    self.key = key;
    self.salt = salt;

};

GlowNodeKey.prototype.bare = function() { return md5( this.key ); };

GlowNodeKey.prototype.get = function() { return md5( this.key + this.salt ); };

GlowNodeKey.prototype.test = function( salt ) { return md5( this.key + salt ); };

GlowNodeKey.prototype.with = function( salt ) {

    var hash = md5( this.key + saltOrder( salt, this.salt ).join('') );

    return {
        make: function() { return hash; },
        test: function( other ) { return hash === other; }
    };
};

module.exports = GlowNodeKey;
