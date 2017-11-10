'use strict';

var rp = require('request-promise');

var synchronizePayload = require('../glow-handshake/payload-synchronize.js');
var acknowledgeValid = require('../glow-handshake/payload-acknowledge.js').valid;
var confirmPayload = require('../glow-handshake/payload-confirm.js');
var confirmedValid = require('../glow-handshake/payload-confirmed.js').valid;

module.exports = function( server ) {
    return function() {

        server.state.candidates.forEach( function( ip ) {
            if ( server.state.candidates.contains( ip ) ) {

                server.state.candidates.remove( ip );

                rp({
                    uri: ['http://', ip, '/synchronize'].join(''),
                    method: 'POST',
                    json: true,
                    body: synchronizePayload( server.state )
                })

                .then( function( ack ) {

                    server.log.write('message', 'server', `Received a response from ${ip}.`);

                    const ackValid = acknowledgeValid( ack, server.state, ip );

                    if ( ackValid[0] ) {

                        server.log.write('message', 'server', `Received a correct key pair in ACK from ${ip}. sending CONF.`);
                        server.state.acknowledgements.add( ack.key );

                        rp({
                            uri: ['http://', ip, '/confirm' ].join(''),
                            method: 'POST',
                            json: true,
                            body: confirmPayload( ack, server.state )
                        })
                        .then( function( done ) {

                            server.log.write('message', 'server', `Received response from ${ip}.`);

                            const doneValid = confirmedValid( done, server.state, ip );

                            if ( doneValid[0] ) {

                                server.log.write('message', 'server', `Received a valid DONE from ${ip}, updating state.`);

                                server.state.acknowledgements.remove( done.key );
                                server.state.candidates.add( ip );

                                server.state.purge( done.ip, done.port );
                                server.state.update( done );

                                server.log.printState( server.state.state );

                            } else {

                                server.log.write( 'warning', 'server', doneValid[1] );
                                server.state.acknowledgements.remove( done.key );
                                server.state.candidates.add( ip );

                            }

                        })
                        .catch( function( err ) {

                            server.log.write('error', 'server', `Received an error response from ${ip}: ` + err.message );

                        });


                    } else {

                        server.log.write( 'warning', 'server', ackValid[1] );
                        server.state.candidates.add( ip );

                    }

                })
                .catch( function(  ) {
                    //server.log.write('warning', 'server', `Error from ${ip}: ${err.message}. `)
                    server.state.candidates.add( ip );

                });

            }

        });
    };

};
