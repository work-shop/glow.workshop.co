'use strict';

var SerialPort = require('serialport');


var GlowNodeIO = function( server ) {
    if (!(this instanceof GlowNodeIO)) { return new GlowNodeIO( server ); }
    var self = this;

    /**
     * IO resources and constants
     */
    self.log = server.log;

    self.config = server.config;

    self.dryrun = server.config.dryrun;

    self.writePollingInterval = server.config.writePollingInterval;

    self.readPollingInterval = server.config.readPollingInterval;

    /**
     * TODO: make this a more general parameter that can be independently configured.
     */
    self.driftPollingInterval = 10 * server.config.readPollingInterval;

    /**
     * 30 second calibration period sets the server's low and high ends.
     * The box will adjust these for drift over time.
     *
     * TODO: make this a more general parameter that can be independently configured.
     */
    self.calibration_period = 2500;


    self.server = server;

    self.rpio = server.config.rpio;

    self.r_pin = server.config.hardware.PWM.R_PIN;

    self.g_pin = server.config.hardware.PWM.G_PIN;

    self.b_pin = server.config.hardware.PWM.B_PIN;


    /**
     * IO state
     */
    self.intervals = [];

    self.time = 0;

    self.timestep = self.writePollingInterval / 1000;

    self.sensor = null;

    self.low = null;

    self.high = null;

    self.state = 0;

    /**
     * IO Instance Methods
     */

    /**
     * This routine instantiates interruptable polling on the specified serial port.
     * It reassembles serial packets received from the Arduino, and sends state updates
     * to the internal state of the node.
     */
    self.pollHardwareState = require('./sensor-watch.js')( self );

    /**
     * This routine runs a hardware calibration routine to set the Low and High sends
     * of this node's sensor spectrum. This routine will block sensor processing until calibrated,
     * and requires User Input. It WILL NOT block network input, however.
     */
    self.calibrateHardwareState = require('./sensor-guess.js')( self );

};


GlowNodeIO.prototype.writeHardwareState = function() {

    var self = this;

    this.log.write('message', 'io:pwm', `Starting hardware write on a ${ self.writePollingInterval }ms interval.` );

    self.intervals.push( setInterval( function() {

        let oscillators = self.server.state.getOscillators( self.time );

        console.log( `R = ${ parseInt( oscillators.r ) }` );
        console.log( `G = ${ parseInt( oscillators.g ) }` );
        console.log( `B = ${ parseInt( oscillators.b ) }` );
        console.log(  );

        self.rpio.pwmSetData( self.r_pin, parseInt( oscillators.r ) );
        self.rpio.pwmSetData( self.g_pin, parseInt( oscillators.g ) );
        self.rpio.pwmSetData( self.b_pin, parseInt( oscillators.b ) );

        self.time += self.timestep;

    }, self.writePollingInterval ));

};

/**
 * This routine clears any scheduled intervals.
 */
GlowNodeIO.prototype.clearSchedule = function() {

    this.sensor.clearIntervals();

    return this;

};

GlowNodeIO.prototype.testCycle = function( steps ) {

    var self = this;

    steps.forEach( function( div ) {
        self.rpio.pwmSetData( self.r_pin, self.config.hardware.PWM.MAX_INTERVAL / div );
        self.rpio.pwmSetData( self.g_pin, self.config.hardware.PWM.MAX_INTERVAL / div );
        self.rpio.pwmSetData( self.b_pin, self.config.hardware.PWM.MAX_INTERVAL / div );
        self.rpio.msleep( 100 );
    });

    self.rpio.pwmSetData( self.r_pin, 0 );
    self.rpio.pwmSetData( self.g_pin, 0 );
    self.rpio.pwmSetData( self.b_pin, 0 );

    return this;

};

/**
 * This routine starts the process, opening the required pins for PWM writing,
 * opening the serial port for sensor readings, and running a brief test testCycle
 * to ensure the pins are connected properly.
 *
 */
GlowNodeIO.prototype.start = function() {

    var self = this;

    this.rpio.pwmSetClockDivider( self.config.hardware.PWM.CLOCK_INTERVAL_DIVIDER );

    this.rpio.pwmSetRange( self.r_pin, self.config.hardware.PWM.RANGE );
    this.rpio.pwmSetRange( self.g_pin, self.config.hardware.PWM.RANGE );
    this.rpio.pwmSetRange( self.b_pin, self.config.hardware.PWM.RANGE );

    this.rpio.open( self.r_pin, this.rpio.PWM );
    this.rpio.open( self.g_pin, this.rpio.PWM );
    this.rpio.open( self.b_pin, this.rpio.PWM );

    this.testCycle( [ 4, 2, 1, 2, 4 ] );

    this.serial = new SerialPort( self.config.serialPort, { baudRate: self.config.baudRate }, function( err ) {
        if ( err ) {

            self.log.write('error', 'io:serial', err.message );

        } else {

            self.log.write('message', 'io:serial', `Opened Serial Port on ${self.config.serialPort} at ${self.config.baudRate} baud.`);

            self.sensor = new require('./sensor-poll.js')( self );

            self.calibrateHardwareState( function() {

                self.pollHardwareState();

                self.writeHardwareState();

            });

        }

    });

};


/**
 * This routine resets any active pins, closes the utilized serial port,
 * and clears any scheduled intervals. This routine should not be called directly,
 * It is called by the server when it receives a termination request from the process.
 */
GlowNodeIO.prototype.terminate = function() {

    var self = this;

    this.log.write('message', 'io:manage', 'Received polite quit request...' );

    this.clearSchedule();

    this.rpio.open( self.r_pin, this.rpio.PIN_RESET );
    this.rpio.open( self.g_pin, this.rpio.PIN_RESET );
    this.rpio.open( self.b_pin, this.rpio.PIN_RESET );

    this.serial.close( function() { self.log.write('message', 'io:serial', 'Closed serial port.'); });

};


module.exports = GlowNodeIO;
