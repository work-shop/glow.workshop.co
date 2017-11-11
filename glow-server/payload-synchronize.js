'use strict';

module.exports = function( state ) {
    return {
        phase: 'SYN',
        state: state.local_state,
        parameters: state.parameters,
        key: state.key.get(),
        salt: state.salt,
        ip: state.ip,
        port: state.port
    };
};
