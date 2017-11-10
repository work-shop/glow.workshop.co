'use strict';

const args = require('./arguments.js');

var GlowLog = require('./glow-log');
var GlowNodeServer = require('./glow-server.js');

var server = new GlowNodeServer( args, new GlowLog( args ) );

server.initialize();
