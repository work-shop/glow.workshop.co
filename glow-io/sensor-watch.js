'use strict';



const map = function( t, p ) { return Math.round(((100/1024) * t) * p) / p; };

const adjust_interval_endpoint = function( drift, io ) { io[ ( io.state === 0 ) ? 'low' : 'high' ] += drift; };

module.exports = function( io ) {
    return function() {

        io.sensor.pollDrift( function( drift ) {

            /** Take the smaller of a fixed Threshold, and the split difference
             * And out low and high points. The fixed threshold is given as 102.4,
             * or 10% of the range.
             */
            let threshold = Math.min( 102.4, (io.high - io.low) / 2 );

            io.log.write('message', 'io:sensor', `Threshold = ${threshold}, ${ map( threshold, 10000 ) }`);
            io.log.write('message', 'io:sensor', `drift = ${ drift } = ${ map( drift, 10000 ) }`);

            /**
             * In this case, the drift is less than the specified threshold,
             * so we don't change state, but we add the net drift to the proper
             * endpoint value in an effort to compensate.
             */
            if ( Math.abs( drift ) < threshold ) {

                io.log.write('message', 'io:sensor', `Drift below threshold, updating endpoint by ${ drift }.`);

                adjust_interval_endpoint( drift, io );

            } else if ( Math.abs( drift ) >= threshold ) {
                /**
                 * In this case, we're above the threshold, so we need to trigger a state transition.
                 * We're also going to do some sanity checking –
                 */

                if ( io.state === 0 && drift > 0 ) {
                    /**
                     * Sensor rising edge detected. Set the state to high, post an update.
                     */
                     io.state = 1;
                     io.server.state.updateSelf( 1 );

                } else if ( io.state === 0 && drift < 0 ) {
                    /**
                     * Sensor is low, and a falling edge detected. Percipitous change to low-end steady-state implicit.
                     * Update boundaries accordingly.
                     */
                     io.low += drift;

                } else if ( io.state === 1 && drift > 0 ) {
                    /**
                     * Sensor is high, and a rising edge was detected. Percipitous change to high-end steady-state implicit.
                     * Update boundaries accordingly.
                     */
                     io.high += drift;

                } else if ( io.state === 1 && drift < 0 ) {
                    /**
                     * Sensor falling edge detected. Set state to low, post an update.
                     */
                     io.state = 0;
                     io.server.state.updateSelf( 0 );

                } else {
                    /**
                     * We've reached a theoterically impossible condition, where drift is zero,
                     * which should be ruled out by the previous guard... fail.
                     */
                     io.log.write('error', 'io:sensor', `Impossible case: ?? |drift| > threshold, but drift === 0 ??`);
                }

            }

        }, io.readPollingInterval );

        return io;

    };

};
