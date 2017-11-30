'use strict';

const linearmap = require('./linear-map.js');

module.exports = function( self ) {

    const map = linearmap( 0, 1 )( 0, self.config.hardware.PWM.MAX_INTERVAL );

    return function() {

        const state = self.get();

        const s = self.local_state;

        const k = state.reduce( function( b,a ) { return b + a.state; }, 0) - s;

        if ( s === 1 ) {

            return {
                r: parseInt( Math.floor( map( 1 ) ) ),
                g: 0,
                b: 0
            };

        } else {

            if ( k > 0 ) {

                return {
                    r: 0,
                    g: parseInt( Math.floor( map( 1 ) ) ),
                    b: 0
                };

            } else {

                return {
                    r: 0,
                    g: 0,
                    b: parseInt( Math.floor( map( 1 ) ) )
                };

            }

        }

    };
};
