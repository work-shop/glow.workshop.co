'use strict';

const linearmap = require('./linear-map.js');

const lambda = 4;

const omega = (2 * Math.PI) / lambda;

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

            if ( k_n < 1/6 ) {

                let A_b = 0.5;

                return {

                    r: 0,
                    g: 0,
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 1/3 ) {

                let A_y = 0.25;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: 0

                };

            } else if ( k_n < 1/2 ) {

                let A_b = 0.75;

                return {

                    r: 0,
                    g: 0,
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 2/3 ) {

                let A_y = 0.375;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: 0

                };

            } else if ( k_n < 5/6 ) {

                let A_b = 1;

                return {

                    r: 0,
                    g: 0,
                    b: parseInt( Math.floor( passive_map( A_b * Math.sin( omega * t ) + A_b ) ) )

                };

            } else if ( k_n < 1 ) {

                let A_y = 0.5;

                return {

                    r: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    g: parseInt( Math.floor( passive_map( A_y * Math.sin( omega * t ) + A_y ) ) ),
                    b: 0

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
