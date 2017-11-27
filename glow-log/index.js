'use strict';

require('colors');

function decideType( type ) {
    switch ( type ) {
        case 'admin':
            return type.blue.bold;

        case 'drift':
            return type.bold;

        case 'pressure':
            return type;

        case 'message':
            return type.green.bold;

        case 'warning':
            return type.yellow;

        case 'error':
            return ' '+type.red+' ';

        default:
            return type;
    }
}


var GlowLog = function( config ) {
    if (!(this instanceof GlowLog)) { return new GlowLog( config); }
    var self = this;

    self.precision = 0.01;

    self.write = function( type, source, message, loglevel ) {

        loglevel = loglevel || 0;

        // TODO: replace this hardcoded log-level constant with a configuration parameter. This can also replace 'debug' at the cmd line.
        if ( config.debug || loglevel > 3 ) { console.log(['['.gray, decideType( type ), ']\t('.gray, source, ')\t'.gray, message ].join('') ); }

        return this;
    };

    self.printState = function( state ) {
        if ( config.debug ) {

            console.log('[ host ]\t\t(key)'.gray);

            state.forEach( function( value, key ) {

                console.log(['['.gray, value.ip, ':'.gray, value.port, ']\t('.gray, key, ')\t\tstate: '.gray, `${ value.state }`.bold ].join('') );

            });
        }

        return this;
    };
};

module.exports = GlowLog;
