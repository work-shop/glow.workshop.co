'use strict';

var updateValid = require('./payload-update.js').valid;
var confirmedPayload = require('./payload-update-confirmed.js');
var errorPayload = require('./payload-error.js');

module.exports = function( server ){
    return function( req, res ) {

        var valid = updateValid( req.body, server.state, `${req.body.ip}:${req.body.port}`);

        if ( valid[0] ) {

            server.log.write('message', 'server', `received a valid update request from ${req.body.ip}:${req.body.port}`);
            server.state.update( req.body );
            res.json(confirmedPayload( req.body, server.state ));

        } else {

            server.log.write('warning', 'server', `Error: ${valid[1]}`);
            res.json(errorPayload( valid[1], server.state) );

        }

    };
};
