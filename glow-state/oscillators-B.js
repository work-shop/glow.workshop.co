'use strict';

const linearmap = require('./linear-map.js');

const a = 0.85;

const f = function( k, n ) {
    return Math.PI * a * ( k + 1 ) / n;
};

const A = function( c1, c2, c3 ) {
    return function( k, n ) {
        return Math.min( (c1 * Math.pow(k - c2 * n, 2) / n) + ( c3/n ), n );
    };
};


/**
 * ACTIVE_NODE domain amplitude function for RED Channel
 *
 * This amplitude function is a two parameter function
 * mapping the number of nodes in the network from into an
 * amplitude to weight the time-domain's sinusoid.
 */
const a_r = A(1.5, -0.1, 0);

const a_g = A(1, 0.127, 11.7);

const a_b = A(5.2, 0.56, 0);

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

            const map = linearmap( 0, 2*n )( 0, self.config.hardware.PWM.MAX_INTERVAL );

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

            const map = linearmap( 0, n )( 0, self.config.hardware.PWM.MAX_INTERVAL );

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
