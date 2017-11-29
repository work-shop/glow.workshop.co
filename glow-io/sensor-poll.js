'use strict';


var GlowNodeSensor = function( io ) {
    if ( !(this instanceof GlowNodeSensor)) { return new GlowNodeSensor( io ); }
    var self = this;

    self.io = io;

    self.packet = '';

    self.samples = [];

    self.drifts = [];

    self.pressure_interval = null;

    self.drift_interval = null;

    io.log.write('message', 'io:serial', `Starting hardware read on ${ io.config.serialPort } (${ io.config.baudRate} baud).` );

    /**
     * Whenever the serial port is readable, continue reconstructing the last packet received,
     * or begin reconstructing the next one.
     */
    io.serial.on('readable', function() {

        /** Our packets are being sent from the Arduino in newline-delimited chunks.
         * If the last bit read from the serial port is '\n', then we've received a complete packet,
         * if not, then we're in the middle of a packet, and should concatenate.
         */
        if ( self.packet[ self.packet.length  - 1 ] !== '\n' ) {

            self.packet += io.serial.read();

        } else {

            let sample = parseInt( self.packet.substring( 0, self.packet.length - 1 ) );

            self.drifts.push( sample - self.samples[ self.samples.length - 1 ] );
            self.samples.push( sample );

            self.packet = io.serial.read();

        }

    });

};

/**
 * This routine associates an action with the pressure data on a given interval. Replaces
 * any previously set interval monitoring pressure.
 */
GlowNodeSensor.prototype.pollPressure = function( action, interval ) {
    if ( this.pressure_interval !== null ) { clearInterval( this.pressure_interval ); }
    var self = this;

    action = action || function() {};

    interval = interval || this.io.readPollingInterval;

    this.io.log.write('message', 'io:serial', `Starting pressure averaging read on ${ interval }ms.` );

    self.samples.length = 0;

    this.pressure_interval = setInterval( function() {

        let average_pressure = self.samples
            .filter( function( a ) { return !isNaN( a ); })
            .reduce( function(b,a) { return b + a; }, 0 ) / self.samples.length;

        action( average_pressure, self.samples.length );

        self.samples.length = 0;

    }, interval );

    return this;

};

/**
 * This routine associates an action with the drift data on a given interval. Replaces
 * any previously set interval monitoring drift.
 */
GlowNodeSensor.prototype.pollDrift = function( action, interval ) {
    if ( this.drift_interval !== null ) { clearInterval( this.drift_interval ); }
    var self = this;


    action = action || function() {};

    interval = interval || this.io.driftPollingInterval;

    this.io.log.write('message', 'io:serial', `Starting drift averaging read on ${ interval }ms.` );

    self.drifts.length = 0;

    this.drift_interval = setInterval( function() {

        let integrated_drift = self.drifts
            .filter( function( a ) { return !isNaN( a ); })
            .reduce( function(b,a) { return b + a; }, 0 );

        action( integrated_drift, self.drifts.length );

        self.drifts.length = 0;

    }, interval );

    return this;

};

/**
 * This routine frees schedules and resources associated with
 * this sensor.
 */
GlowNodeSensor.prototype.clearIntervals = function() {
    if ( this.pressure_interval !== null ) { clearInterval( this.pressure_interval ); }
    if ( this.drift_interval !== null ) { clearInterval( this.drift_interval ); }

    this.pressure_interval = null;
    this.drift_interval = null;

    return this;
};


module.exports = GlowNodeSensor;
