'use strict';

let args = require('./arguments.js');

let GlowLog = require('./glow-log');
let GlowNodeServer = require('./glow-server');

let server = new GlowNodeServer( args, new GlowLog( args ) );

/**
 * Start the server and hardware interrupts.
 */
server.initialize();

/**
 * Catch a SIGINT signal, and gracefully shutdown the hardware and webserver.
 */
process.on('SIGINT', function() {
    server.terminate();
    process.exit( 1 );
});
