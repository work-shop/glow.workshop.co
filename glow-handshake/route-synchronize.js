'use strict';


var acknowledgePayload = require('./payload-acknowledge.js');
var errorPayload = require('./payload-error.js');

module.exports = function( server ){
    return function( req, res ) {
        server.log.write('message', 'server', `received a synchronize request from ${req.body.ip}:${req.body.port}`);

        if ( req.body.salt === server.state.salt ) {

            server.log.write('warning', 'server', `${req.body.ip}:${req.body.port} sent an identical id-salt to this node. Refusing connection.`);
            res.json( errorPayload( 'Error: matching salts exchanged.', server.state ) );

        } else if ( server.state.acknowledgements.contains(`${req.body.ip}:${req.body.port}`) ) {

            server.log.write('warning', 'server', `${req.body.ip}:${req.body.port} is in the set of pending acknowledgements.`);
            res.json( errorPayload( 'Error: requesting host is in the set of pending acknowledgements.', server.state ) );

        } else if ( !server.state.candidates.contains(`${req.body.ip}:${req.body.port}`) ) {

            server.log.write('warning', 'server', `${req.body.ip}:${req.body.port} is not in the set of viable candidate hosts.`);
            res.json( errorPayload( 'Error: requesting host is not in the set viable candidates.', server.state ) );

        } else if ( server.state.key.test( req.body.salt ) === req.body.key ) {

            server.log.write('message', 'server', `${req.body.ip}:${req.body.port} sent a valid key + salt combination – sending ACK.`);

            server.state.candidates.remove(`${req.body.ip}:${req.body.port}`);
            server.state.acknowledgements.add( server.state.key.with( req.body.salt ).make() );
            res.json( acknowledgePayload( req.body, server.state ) );

        } else {

            server.log.write('warning', 'server', `${req.body.ip}:${req.body.port} sent an invalid key + salt combination. Refusing connection.`);
            res.json( errorPayload( 'Error: Invalid Key.', server.state ) );

        }


    };
};
