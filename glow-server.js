'use strict';

var http = require('http');

var express = require('express');

var GlowNodeState = require('./glow-state');

var handshakeRoutes = require('./glow-handshake');

var GlowNodeServer = function( config, log ) {
    if (!(this instanceof GlowNodeServer)) { return new GlowNodeServer( config, log); }
    var self = this;

    self.config = config;

    self.port = parseInt( config.port );

    self.port_max_retries = parseInt( config.port_max_retries );

    self.app = express();

    self.log = log;

    self.scan = require('./glow-scan')( self );

};



GlowNodeServer.prototype.initialize = function() {

    this.app.use( require('body-parser').json() );

    this.app.post( '/synchronize', handshakeRoutes.synchronize( this ) );

    this.app.post( '/confirm', handshakeRoutes.confirm( this ) );

    this.listen( this.scan );

};



GlowNodeServer.prototype.listen = function( next ) {

    var i = 0;
    var self = this;
    var server = http.createServer( this.app );

    server.on('error', function( e ) {
        if ( e.errno === 'EADDRINUSE' && i < self.port_max_retries ) {

            self.log.write('warning', 'server', e.message );

            self.port += 1;
            self.config.port += 1;
            i += 1;

            server.listen( self.port);

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

// GlowNodeServer.prototype.send = function() {
//
// };
//
// GlowNodeServer.prototype.recv = function() {
//
// };
//
// GlowNodeServer.prototype.glow = function() {
//
// };
//
// GlowNodeServer.prototype.test = function() {
//
// };


module.exports = GlowNodeServer;
