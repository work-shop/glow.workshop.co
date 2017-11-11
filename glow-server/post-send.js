'use strict';

var rp = require('request-promise');
var updatePayload = require('./payload-update.js');
var updateConfirmedValid = require('./payload-update-confirmed.js').valid;
var errorValid = require('./payload-error.js').valid;

module.exports = function( server ) {
    return function( binaryState, attempt ) {

        attempt = attempt || 0;

        var state = server.state.updateSelf( binaryState );

        if ( state ) {

            server.state.state.forEach( function( value, key ) {
                if ( value.ip !== server.state.ip || value.port !== server.state.port ) {

                    rp({
                        uri: ['http://', [value.ip, value.port].join(':'), '/update'].join(''),
                        method: 'POST',
                        json: true,
                        body: updatePayload( key, server.state )
                    })
                    .then( function( res ) {
                        server.log.write( 'message', 'server', `Connection ${key}: Pushed updated state (${ server.state.local_state }) to ${value.ip}:${value.port}.`);

                        var validUpdateConfirmed = updateConfirmedValid( res, server.state, `${value.ip}:${value.port}`);
                        var validError = errorValid( res, server.state, `${value.ip}:${value.port}` );

                        if ( validUpdateConfirmed[0] ) {

                            server.log.write( 'message', 'server', `Connection ${key}: Update confirmed on ${value.ip}:${value.port}.`);
                            server.state.update( res );

                        } else if ( validError[0] ) {

                            server.log.write( 'warning', 'server', `Connection ${key}: Update rejected on ${value.ip}:${value.port}.`);

                        } else {
                            server.log.write( 'error', 'server', `Connection ${key} returned an undefined state from ${value.ip}:${value.port}. Removing connection.`);
                            server.state.state.delete( key );
                            server.state.candidates.add( `${value.ip}:${value.port}` );
                        }

                    })
                    .catch( function( err ) {
                        server.log.write( 'error', 'server', `Error in update: ${err.message}`);

                        if ( err.error.errno === 'ECONNREFUSED' || err.error.errno === 'ETIMEDOUT' ) {
                            server.state.state.delete( key );
                            server.state.candidates.add( `${value.ip}:${value.port}` );
                        }

                    });

                }

            });

        }

    };
};
