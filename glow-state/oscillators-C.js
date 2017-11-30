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
const a_r = A(-4.5, -4.5, 1, 1.1, 0.9);

const a_g = A(26, -0.3, -2.3, 0.3, 0.6);

const a_b = A(0, 2.75, -1.8, 0.4, 0.1);

module.exports = function( self ) {
    return function( t ) {

        const state = self.get();

        const s = self.local_state;

        const k = state.reduce( function( b,a ) { return b + a.state; }, 0) - s;

        const n = state.length;

        const R_a = a_r( k, n );

        const G_a = a_g( k, n );

        const B_a = a_b( k, n );

        if ( self.local_state === 0 ) {

            const map = linearmap( 0, 2 )( 0, self.config.hardware.PWM.MAX_INTERVAL );

            const omega = f( k, n );

            const r = map( R_a * Math.sin( omega * t ) + R_a );
            const g = map( G_a * Math.sin( omega * t ) + G_a );
            const b = map( B_a * Math.sin( omega * t ) + B_a );

            return {

                r: parseInt( Math.floor( r ) ),

                g: parseInt( Math.floor( g ) ),

                b: parseInt( Math.floor( b ) )
            };

        } else if ( self.local_state === 1 ) {

            const map = linearmap( 0, 1 )( 0, self.config.hardware.PWM.MAX_INTERVAL );

            const r = map( R_a );
            const g = map( G_a );
            const b = map( B_a );

            return {

                r: parseInt( Math.floor( r ) ),

                g: parseInt( Math.floor( g ) ),

                b: parseInt( Math.floor( b ) )

            };

        }

    };
};
