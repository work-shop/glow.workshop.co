'use strict';

module.exports = function( io ) {
    return function( done ) {
        setTimeout( function() {

            io.low = 0;
            io.high = io.config.hardware.FSR.MAX_VALUE;

            done();

        }, io.config.hardware.STARTUP_DELAY );
    };
};
