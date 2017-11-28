'use strict';

module.exports = function( self ) {
    return function( t ) {

        let state = self.get();

        let active_nodes = state.reduce( function( b,a ) { return b + a.state; }, 0);

        /**
         * These amplitude terms are used to balance the Red, Green, and Blue channels. Each should be in the range 0-1.
         * Additionally, the amplitude terms are functions of the current state of the system.
         * The amplitude is proportional to the ratio of active to total nodes.
         * The amplitude has a zero when no nodes are active. We correct for this switch
         * a small ground state term.
         */
        let a_factor = (active_nodes === 0) ? 1 : (active_nodes / state.length);

        let r_a = a_factor;
        let g_a = a_factor;
        let b_a = a_factor;

        /**
         * The frequency is proportional to the number of active nodes (with π as a normalizing term.)
         * positive adjustment to the denominator of the frequency term.
         */
        let f_factor = 2 * Math.PI * active_nodes / state.length;

        let r_f = f_factor;
        let g_f = f_factor;
        let b_f = f_factor;

        /**
         * These phase terms slide the range around in time.
         * The phase factors determine what the static ground state is. If ϕ = 0, then
         * the the ground stat is given as 0
         */
        let r_ph = - Math.PI; // cancel the red channel
        let g_ph = - Math.PI / 2;
        let b_ph = - Math.PI;

        let r = r_a * Math.cos( r_f * t + r_ph );
        let g = g_a * Math.cos( g_f * t + g_ph );
        let b = b_a * Math.cos( b_f * t + b_ph );

        return {
            r: parseInt( Math.floor( self.map( r ) ) ),
            g: parseInt( Math.floor( self.map( g ) ) ),
            b: parseInt( Math.floor( self.map( b ) ) ),
        };
    };
};
