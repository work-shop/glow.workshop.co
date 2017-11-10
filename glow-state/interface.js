'use strict';

var os = require('os');

module.exports = function getInterface( config, log ) {

    var inet = os.networkInterfaces()[ config.interface ];

    if ( typeof inet === 'undefined' ) {
        log.write('error', 'state ', `The specified network interface – ${config.interface} – is not present on the host.`);
        process.exit( 1 );
    }

    inet = inet.filter( function( iface ) { return iface.family === 'IPv4'; });

    if ( inet.length !== 1 ) {
        log.write('error', 'state ', `The specified network interface – ${config.interface} – does not present an IPv4 address.`);
        process.exit( 1 );
    }

    return inet[0];

};
