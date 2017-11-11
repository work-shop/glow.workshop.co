'use strict';


var GlowNodeSensor = function( server ) {
    if (!(this instanceof GlowNodeSensor)) { return new GlowNodeSensor( server ); }
    var self = this;

    self.log = server.log;

    self.threshold = server.config.threshold;

    self.pollingInterval = server.config.pollingInterval;

    self.dryrun = server.config.dryrun;

    self.server = server;

    self.Gpio = ( self.dryrun ) ? function() {} : require('onoff').Gpio;

};

GlowNodeSensor.prototype.start = function() {

    var self = this;

    if ( this.dryrun ) {

        setInterval( function() {

            var binaryState = (Math.random() >= self.threshold ) ? 1 : 0;

            self.server.send( binaryState );

        }, self.pollingInterval );

    } else {
        this.log.write('warning', 'sensor', 'Live polling from the sensor is not currently implemented' );

    }
};


module.exports = GlowNodeSensor;
