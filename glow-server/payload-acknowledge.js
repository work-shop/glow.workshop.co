'use strict';



var acknowledgePayload = function( syn, state ) {
    return {
        phase: 'ACK',
        state: state.local_state,
        parameters: state.parameters,
        key: state.key.with( syn.salt ).make(),
        salt: state.salt,
        ip: state.ip,
        port: state.port
    };
};

acknowledgePayload.valid = function( ack, state, ip ) {

    const phase_valid = (typeof ack.phase !== 'undefined') && ack.phase === 'ACK';
    const state_valid = (typeof ack.state !== 'undefined');
    const parameters_valid = (typeof ack.parameters !== 'undefined');
    const key_valid = (typeof ack.key === 'string') && state.key.with( ack.salt ).test( ack.key );
    const salt_valid = (typeof ack.salt === 'string') && ack.salt.length === 5;
    const ip_valid = (typeof ack.ip !== 'undefined');
    const port_valid = (typeof ack.port !== 'undefined');

    if ( !phase_valid && ack.phase === 'ERR' ) {

        return [ false, ack.message ];

    } else if ( !(phase_valid && state_valid && parameters_valid && salt_valid && ip_valid && port_valid) ) {

        return [ false, `The packet passed from ${ip} was not a well-formed 'acknowledge' packet.`];

    } else if ( !key_valid ) {

        return [ false, `The key phrase passed from ${ip} did not match the password salt combination on this node.`];

    } else {

        return [ true, ``];

    }

};


module.exports = acknowledgePayload;
