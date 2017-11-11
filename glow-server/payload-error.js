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

    const phase_valid = (typeof ack.phase !== 'undefined') && ack.phase === 'ERR';
    const ip_valid = (typeof ack.ip !== 'undefined');
    const port_valid = (typeof ack.port !== 'undefined');

    if ( !(phase_valid && ip_valid && port_valid) ) {

        return [ false, `The packet passed from ${ip} was not a well-formed 'error' packet.`];

    } else {

        return [ true, ``];

    }

};

module.exports = errorPayload;
