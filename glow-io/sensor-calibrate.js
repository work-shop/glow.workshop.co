'use strict';

const map_pressure = function( t ) { return Math.round(((100/1024) * t) * 100) / 100; };

const runCalibration = function( io, next ) { io.sensor.pollPressure( next, io.calibration_period ); };

module.exports = function( io ) {
    return function( done ) {
        setTimeout( function() {

            io.log.write('admin', 'io:serial', `=== LET'S CALIBRATE HARDWARE! ===`, 5);
            io.log.write('admin', 'io:serial', `Okay, dude. Ensure that the sensor is in its 'low' state.`, 5);
            io.log.write('admin', 'io:serial', `This means nothing should be on the node except its dead load.`, 5);
            io.log.write('admin', 'io:serial', `Hit any enter when you're ready...`, 5);

            process.stdin.on('readable', function() {

                let chunk = process.stdin.read();

                if ( chunk !== null ) {

                    process.stdin.removeAllListeners( 'readable' );

                    io.log.write('admin', 'io:serial', `Okay, beginning calibration cycle for 'low' state: ${ io.calibration_period / 1000 } seconds.`, 5);

                    runCalibration( io, function( pressure, samples ) {

                        io.sensor.clearIntervals();

                        io.low = pressure;

                        io.log.write('admin', 'io:serial', `Average 'low' pressure recorded at ${ map_pressure( pressure ) }% of max over ${ samples } samples.\n`, 5);
                        io.log.write('admin', 'io:serial', `Nice one. Okay, ensure that the sensor is in a reasonable 'high' state.`, 5);
                        io.log.write('admin', 'io:serial', `This means that someone should be sitting on the node.`, 5);
                        io.log.write('admin', 'io:serial', `This individual should remain seated on the node for the duration of the test.`, 5);
                        io.log.write('admin', 'io:serial', `Hit any enter when you've ensured this...`, 5);

                        process.stdin.on('readable', function() {

                            let chunk = process.stdin.read();

                            if ( chunk !== null ) {

                                process.stdin.removeAllListeners( 'readable' );

                                io.log.write('admin-required', 'io:serial', `Okay, beginning calibration cycle for 'high' state: ${ io.calibration_period / 1000 } seconds.`, 5);

                                runCalibration( io, function( pressure, samples ) {

                                    io.sensor.clearIntervals();

                                    io.high = pressure;

                                    io.log.write('admin', 'io:serial', `Average 'high' pressure recorded at ${ map_pressure( pressure ) }% of max over ${ samples } samples.\n`, 5);
                                    io.log.write('admin', 'io:serial', `Nice one. We're done. The node will attempt to compensate for drift over time,`, 5);
                                    io.log.write('admin', 'io:serial', `Using the values you've provided as a baseline.`, 5);
                                    io.log.write('admin', 'io:serial', `=== CALIBRATION COMPLETE! ===`, 5);

                                    done();

                                });

                            }

                        });


                    });

                }

            });

        }, io.config.hardware.STARTUP_DELAY );
    };
};
