'use strict';

var SerialPort = require('serialport');


var GlowNodeIO = function( server ) {
    if (!(this instanceof GlowNodeIO)) { return new GlowNodeIO( server ); }
    var self = this;

    self.log = server.log;

    self.config = server.config;

    self.threshold = server.config.threshold;

    self.writePollingInterval = server.config.writePollingInterval;

    self.readPollingInterval = server.config.readPollingInterval;

    self.dryrun = server.config.dryrun;

    self.server = server;

    self.rpio = server.config.rpio;

    self.intervals = [];

    self.r_pin = server.config.hardware.PWM.R_PIN;

    self.g_pin = server.config.hardware.PWM.G_PIN;

    self.b_pin = server.config.hardware.PWM.B_PIN;

    self.time = 0;

    self.timestep = (2 * Math.PI) / self.writePollingInterval;

};


GlowNodeIO.prototype.writeHardwareState = function() {

    var self = this;

    this.log.write('message', 'io:pwm', `Starting hardware write on a ${ self.writePollingInterval }ms interval.` );

    self.intervals.push( setInterval( function() {

        let oscillators = self.server.state.getOscillators( self.time );

        self.rpio.pwmSetData( self.r_pin, parseInt( oscillators.r ) );
        self.rpio.pwmSetData( self.g_pin, parseInt( oscillators.g ) );
        self.rpio.pwmSetData( self.b_pin, parseInt( oscillators.b ) );

        self.time += self.timestep;

    }, self.writePollingInterval ));

};



/**
 * This routine instantiates interruptable polling on the specified serial port.
 * It reassembles serial packets received from the Arduino, and sends state updates
 * to the internal state of the node.
 */
GlowNodeIO.prototype.pollHardwareState = function() {

    var self = this;
    let packet = '';

    this.log.write('message', 'io:serial', `Starting hardware read on ${ self.config.serialPort } (${ self.config.baudRate} baud).` );

    self.serial.on('readable', function() {

        /** Our packets are being sent from the Arduino in newline-delimited chunks.
         * If the last bit read from the serial port is '\n', then we've received a complete packet,
         * if not, then we're in the middle of a packet, and should concatenate.
         */
        if ( packet[ packet.length  - 1 ] !== '\n' ) {

            packet += self.serial.read();

        } else {

            self.server.state.updateSelf( ( parseInt( packet.substring( 0, packet.length - 1 ) ) > self.config.threshold ) ? 1 : 0 );

            packet = self.serial.read();

        }

    });

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
            self.pollHardwareState();
            self.writeHardwareState();

        }

    });

};



GlowNodeIO.prototype.terminate = function() {

    var self = this;

    this.log.write('message', 'io:manage', 'Received polite quit request...' );
    this.intervals.forEach( function( interval ) { clearInterval( interval ); });

    this.rpio.open( self.r_pin, this.rpio.PIN_RESET );
    this.rpio.open( self.g_pin, this.rpio.PIN_RESET );
    this.rpio.open( self.b_pin, this.rpio.PIN_RESET );

    this.serial.close( function() { self.log.write('message', 'io:manage', 'Closed serial port.'); });

};


module.exports = GlowNodeIO;
