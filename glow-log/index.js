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

    function truncate( x ) {
        return Math.round( x * (1/self.precision) ) * self.precision;
    }

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

                console.log(['['.gray, value.ip, ':'.gray, value.port, ']\t('.gray, key, ')'.gray].join('') );
                console.log([
                    '\t\t\tstate: '.gray, value.state, ', signature: ('.gray,
                    truncate(value.parameters.cos.a),')cos('.gray, truncate(value.parameters.cos.f), 't'.blue,
                    ') + ('.gray, truncate(value.parameters.sin.a), ')sin('.gray, truncate(value.parameters.sin.f), 't'.blue, ')'.gray
                ].join('') );

            });
        }

        return this;
    };
};

module.exports = GlowLog;
