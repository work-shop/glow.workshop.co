'use strict';

var http = require('http');

var express = require('express');

var GlowNodeState = require('../glow-state');

var GlowNodeServer = function( config, log ) {
    if (!(this instanceof GlowNodeServer)) { return new GlowNodeServer( config, log); }
    var self = this;

    self.config = config;

    self.port = parseInt( config.port );

    self.port_max_retries = parseInt( config.port_max_retries );

    self.app = express();

    self.instance = null;

    self.log = log;

    self.scan = require('./post-scan.js')( self );

    self.send = require('./post-send.js')( self );

    self.io = new require('../glow-io')( self );

    self.state = null;

};

/**
 * This should be called whenever the process is killed.
 */
GlowNodeServer.prototype.terminate = function() {
    this.log.write('message', 'server', 'Received polite termination request... ' );
    this.io.terminate();
    this.state.terminate();
    this.instance.close();
};

GlowNodeServer.prototype.initialize = function() {
    /**
     * Initialize RPIO in the appropriate mode, based on whether we're
     * developing locally, or deployed on the PI.
     */

    this.config.rpio.init({
        'gpiomem': true,
        'mapping': 'physical',
        'mock': ( this.config.dryrun ) ? 'raspi-zero-w' : false
    });

    /**
     * Server Routes.
     */
    this.app.use( require('body-parser').json() );

    this.app.post( '/synchronize', require('./route-synchronize.js')( this ) );

    this.app.post( '/confirm', require('./route-confirm.js')( this ) );

    this.app.post( '/update', require('./route-update.js')( this ) );

    /**
     * Hardware interrupts
     */
    this.io.start();

    this.listen( this.scan );

};



GlowNodeServer.prototype.listen = function( next ) {

    var i = 0;
    var self = this;
    self.instance = http.createServer( this.app );

    self.instance.on('error', function( e ) {
        if ( e.errno === 'EADDRINUSE' && i < self.port_max_retries ) {

            self.log.write('warning', 'server', e.message );

            self.port += 1;
            self.config.port += 1;
            i += 1;

            self.instance.listen( self.port);

        } else {
            self.log.write('error', 'server', `Failed to find accessible port: ${e.message}` );
            process.exit( 1 );

        }

    }).listen( this.port, function()  {

        self.log.write('message', 'server', `This node is listening on port ${self.port}`);
        self.log.write('message', 'server', `This node has key: ${self.config.key}`);
        self.log.write('message', 'server', `This node has salt: ${self.config.salt}`);
        self.state = new GlowNodeState( self.config, self.log );
        next();

    });

};

// GlowNodeServer.prototype.recv = function() {
//
// };
//
// GlowNodeServer.prototype.test = function() {
//
// };


module.exports = GlowNodeServer;
