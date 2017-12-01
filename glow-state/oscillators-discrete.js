'use strict';

const linearmap = require('./linear-map.js');

const a = 0.85;

const f = function( k, n ) {
    return Math.PI * a * ( k + 1 ) / n;
};

module.exports = function( self ) {

    const active_map = linearmap( 0, 1 )( 0, self.config.hardware.PWM.MAX_INTERVAL );
    const passive_map = linearmap( 0, 2 )( 0, self.config.hardware.PWM.MAX_INTERVAL );

    return function( t ) {

        const state = self.get();

        const s = parseInt( self.local_state );

        const k = state.reduce( function( b,a ) { return b + a.state; }, 0) - s;

        const n = state.length;

        const k_n = (k + s) / n;

        if ( s === 1 ) {

            return {

                r: parseInt( Math.floor( active_map( 1 ) ) ),
                g: parseInt( Math.floor( active_map( 1 ) ) ),
                b: parseInt( Math.floor( active_map( 1 ) ) )

            };

        } else {

            let omega = f( k+s, n );

            if ( k_n < 1/6 ) {

                let A_b = 0.5;

                return {

                    r: 0,
                    g: 0,
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 1/3 ) {

                let A_b = 0.7;
                let A_y = 0.1;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 1/2 ) {

                let A_b = 0.4;
                let A_y = 0.5;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 2/3 ) {

                let A_b = 0.3;
                let A_y = 0.7;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 5/6 ) {

                let A_b = 0.2;
                let A_y = 0.9;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 1 ) {

                let A_b = 0.5;
                let A_y = 0.9;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else {

                self.log.write('warning', 'state', '?? s =/= 1, but k/n >= 1 ??');

                return {

                    r: parseInt( Math.floor( active_map( 1 ) ) ),
                    g: parseInt( Math.floor( active_map( 1 ) ) ),
                    b: parseInt( Math.floor( active_map( 1 ) ) )

                };

            }

        }

    };
};
