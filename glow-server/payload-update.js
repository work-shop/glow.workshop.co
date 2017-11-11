'use strict';

var updatePayload = function( key, state ) {
    return {
        phase: 'UPD',
        state: state.local_state,
        parameters: state.parameters,
        key: key,
        salt: state.salt,
        ip: state.ip,
        port: state.port
    };
};

updatePayload.valid = function( upd, state, ip ) {
    const phase_valid = (typeof upd.phase !== 'undefined') && upd.phase === 'UPD';
    const state_valid = (typeof upd.state !== 'undefined');
    const parameters_valid = (typeof upd.parameters !== 'undefined');
    const key_valid = (typeof upd.key === 'string') && state.key.with( upd.salt ).test( upd.key );
    const salt_valid = (typeof upd.salt === 'string') && upd.salt.length === 5;
    const ip_valid = (typeof upd.ip !== 'undefined');
    const port_valid = (typeof upd.port !== 'undefined');

    if ( !phase_valid && upd.phase === 'ERR' ) {

        return [ false, upd.message ];

    } else if ( !(phase_valid && state_valid && parameters_valid && salt_valid && ip_valid && port_valid) ) {

        return [ false, `The packet passed from ${ip} was not a well-formed 'update' packet.`];

    } else if ( !key_valid ) {

        return [ false, `The key phrase passed from ${ip} did not match the password-salt combination on this node.`];

    } else if ( !state.state.has( upd.key ) ) {

        return [ false, `The host key (${upd.key}) is not in the set of valid connections.`];

    } else {

        return [ true, ``];

    }


};

module.exports = updatePayload;
