'use strict';

var errorPayload = function( message, state ) {
    return {
        phase: 'ERR',
        message: message,
        ip: state.ip,
        port: state.port
    };
};

errorPayload.valid = function( ack, state, ip ) {

    const phase_valid = (typeof ack.phase !== 'undefined') && ack.phase === 'ACK';
    const state_valid = (typeof ack.state !== 'undefined');
    const parameters_valid = (typeof ack.parameters !== 'undefined');
    const key_valid = (typeof ack.key === 'string') && state.key.with( ack.salt ).test( ack.key );
    const salt_valid = (typeof ack.salt === 'string') && ack.salt.length === 5;
    const ip_valid = (typeof ack.ip !== 'undefined');
    const port_valid = (typeof ack.port !== 'undefined');

    if ( !(phase_valid && state_valid && parameters_valid && salt_valid && ip_valid && port_valid) ) {

        return [ false, `The packet passed from ${ip} was not a well-formed 'acknowledge' packet.`];

    } else if ( !key_valid ) {

        return [ false, `The key phrase passed from ${ip} did not match the password salt combination on this node.`];

    } else {

        return [ true, ``];

    }

};

module.exports = errorPayload;
