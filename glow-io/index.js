'use strict';

const LOCAL_STATE_INDICATOR_PIN = 16;
const REMOTE_STATE_INDICATOR_PIN = 18;
const LOCAL_FSR_READ_PIN = 22;


var GlowNodeIO = function( server ) {
    if (!(this instanceof GlowNodeIO)) { return new GlowNodeIO( server ); }
    var self = this;

    self.log = server.log;

    self.threshold = server.config.threshold;

    self.writePollingInterval = server.config.writePollingInterval;

    self.readPollingInterval = server.config.readPollingInterval;

    self.dryrun = server.config.dryrun;

    self.server = server;

    self.rpio = server.config.rpio;

    self.intervals = [];

};

GlowNodeIO.prototype.terminate = function() {
    this.log.write('message', 'sensor', 'Received polite quit request...' );
    this.intervals.forEach( function( interval ) { clearInterval( interval ); });
    this.rpio.write( LOCAL_STATE_INDICATOR_PIN, this.rpio.LOW );
    this.rpio.write( REMOTE_STATE_INDICATOR_PIN, this.rpio.LOW );
    this.rpio.close( LOCAL_STATE_INDICATOR_PIN, this.rpio.PIN_RESET );
    this.rpio.close( REMOTE_STATE_INDICATOR_PIN, this.rpio.PIN_RESET );
};

GlowNodeIO.prototype.writeHardwareState = function() {

    var self = this;

    this.log.write('message', 'sensor', `Starting hardware write on ${ self.writePollingInterval }ms interval.` );

    self.intervals.push( setInterval( function() {

        var local_binary_state = self.server.state.local_state;
        var remote_state = self.server.state.get().filter( function( s ) { return s.key !== self.server.state.local_key; });
        var remote_binary_state = 0;

        if ( remote_state.length > 0 ) {
            remote_binary_state = Math.round( remote_state.reduce( function( b,a ) { return b + a.state; }, 0) / remote_state.length );
        }

        self.rpio.write( LOCAL_STATE_INDICATOR_PIN, ( local_binary_state === 1 ) ? self.rpio.HIGH : self.rpio.LOW );
        self.rpio.write( REMOTE_STATE_INDICATOR_PIN, ( remote_binary_state === 1 ) ? self.rpio.HIGH : self.rpio.LOW );

    }, self.writePollingInterval ));

};

GlowNodeIO.prototype.pollHardwareState = function() {

    var self = this;

    this.log.write('message', 'sensor', `Starting hardware write on ${ self.readPollingInterval }ms interval.` );

    if ( this.dryrun ) {

        self.intervals.push( setInterval( function() {

            var binaryState = (Math.random() >= self.threshold ) ? 1 : 0;

            self.log.write('message', 'sensor', `${binaryState}` );

            self.server.send( binaryState );

        }, self.readPollingInterval ) );

    } else {

        self.log.write('warning', 'sensor', 'Live polling from the sensor is not currently implemented, using dry-run.' );

        self.rpio.poll( LOCAL_FSR_READ_PIN, function( ) {

            self.log.write('message', 'sensor', `State change detected on ${LOCAL_FSR_READ_PIN}` );
            self.server.send( ( self.rpio.read( LOCAL_FSR_READ_PIN ) ? 1 : 0 ) );

        });

    }

};

GlowNodeIO.prototype.start = function() {

    this.rpio.open( LOCAL_STATE_INDICATOR_PIN, this.rpio.OUTPUT, this.rpio.HIGH );
    this.rpio.open( REMOTE_STATE_INDICATOR_PIN, this.rpio.OUTPUT, this.rpio.HIGH );
    this.rpio.open( LOCAL_FSR_READ_PIN, this.rpio.INPUT, this.rpio.PULL_DOWN );

    this.log.write('warning', 'sensor', 'Testing LED Output' );
    this.rpio.write( LOCAL_STATE_INDICATOR_PIN, this.rpio.HIGH );
    this.rpio.write( REMOTE_STATE_INDICATOR_PIN, this.rpio.HIGH );
    this.rpio.msleep( 250 );
    this.rpio.write( LOCAL_STATE_INDICATOR_PIN, this.rpio.LOW );
    this.rpio.write( REMOTE_STATE_INDICATOR_PIN, this.rpio.LOW );

    this.pollHardwareState();

    this.writeHardwareState();

};


module.exports = GlowNodeIO;
