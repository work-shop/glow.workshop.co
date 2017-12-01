'use strict';

const linearmap = require('./linear-map.js');

const a = 0.85;

const f = function( k, n ) {
    return Math.PI * a * ( k + 1 ) / n;
};

const A = function( c0, c1, c2, c3, c4 ) {
    return function( k, n ) {

        let t = k / n;

        return Math.max(0, Math.min( c0*Math.pow( t - c4, 3) + c1*Math.pow( t - c4, 2) + c2*(t - c4) + c3, 1) );

    };
};

/**
 * These amplitude functionals define our polynomail amplitude functions,
 * which we'll use to calculate the appropriate mix of color channel amplitudes
 * for the time-domain state function.
 */
const a_b = A(4, 0, 0, 0.5, 0);

const a_y = A(9.5, 5.8, 0.4, 0.8, 0.83);

module.exports = function( self ) {

    const passive_map = linearmap( 0, 2 )( 0, self.config.hardware.PWM.MAX_INTERVAL );

    const active_map = linearmap( 0, 1 )( 0, self.config.hardware.PWM.MAX_INTERVAL );

    return function( t ) {

        const state = self.get();

        const s = parseInt( self.local_state );

        const k = state.reduce( function( b,a ) { return b + a.state; }, 0) - s;

        const n = state.length;

        const B_a = a_b( k, n );

        const Y_a = a_y( k, n );

        if ( self.local_state === 0 ) {

            const omega = f( k, n );

            const y = passive_map( Y_a * Math.sin( omega * t ) + Y_a );

            const b = passive_map( B_a * Math.sin( omega * t ) + B_a );

            return {

                r: parseInt( Math.floor( y ) ),

                g: parseInt( Math.floor( y ) ),

                b: parseInt( Math.floor( b ) )
            };

        } else if ( self.local_state === 1 ) {

            return {

                r: parseInt( Math.floor( active_map( 1 ) ) ),

                g: parseInt( Math.floor( active_map( 1 ) ) ),

                b: parseInt( Math.floor( active_map( 1 ) ) )
            };

        }

    };
};
