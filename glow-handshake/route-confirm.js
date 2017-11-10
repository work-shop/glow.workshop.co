'use strict';


var confirmValid = require('./payload-confirm.js').valid;
var confirmedPayload = require('./payload-confirmed.js');
var errorPayload = require('./payload-error.js');

module.exports = function( server ){
    return function( req, res ) {
        server.log.write('message', 'server', `received a confirm request from ${req.body.ip}:${req.body.port}`);

        const conf = req.body;
        const valid = confirmValid( conf, server.state, `${conf.ip}:${conf.port}` );

        if ( !(valid[0]) ) {

            server.log.write('error', 'server', valid[1] );
            res.json(errorPayload( valid[1], server.state ) );

        } else {

            server.state.acknowledgements.remove( conf.key );
            server.state.candidates.add( `${conf.ip}:${conf.port}` );

            server.state.purge( conf.ip, conf.port );
            server.state.update( conf );

            server.log.write('message', 'server', `received a valid CONF request from ${conf.ip}:${conf.port} – updating state, sending DONE.` );

            server.log.printState( server.state.state );

            res.json(confirmedPayload( conf, server.state ) );

        }

    };
};
