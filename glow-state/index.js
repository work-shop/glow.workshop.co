'use strict';

var Netmask = require('netmask').Netmask;
var FastSet = require('collections/fast-set');
var SortedMap = require('collections/sorted-map');

var GlowNodeKey = require('../glow-key');
var getInterface = require('./interface.js');

var GlowNodeState = function( config, log ) {
    if (!(this instanceof GlowNodeState)) { return new GlowNodeState( config, log ); }
    var self = this;


    self.interface = getInterface( config, log );

    self.ip = self.interface.address;

    self.port_scan_range = config.port_scan_range;

    self.port = config.port;

    self.key = new GlowNodeKey( config.key, config.salt );

    self.salt = config.salt;

    self.local_state = 0;

    self.parameters = {
        sin: {
            a: config.sin_amplitude,
            f: config.sin_frequency
        },
        cos: {
            a: config.cos_amplitude,
            f: config.cos_frequency
        }
    };

    /**
     * Candidates collects the set of valid IP addresses
     * On this subnet. This collection is used to scan the
     * net for paired nodes. It is also used as a first filter
     * against incoming requests.
     */
    self.candidates = new FastSet();

    /**
     * acknowledgements collection is the set of valid hosts with whom
     * we have exchanged glow SYN-ACK packets, and are waiting for a final
     * acceptance of the connection.
     */
    self.acknowledgements = new FastSet();

    /**
     * The state variable keeps track of the state
     * of all nodes in the network according to the belief of
     * this node. it maps identifiers for each node-node connection
     * into either a 0 or a 1 depending on this node's belief about
     * the state of that node.
     */
    self.state = new SortedMap();


    /**
     * TODO:
     * Determine actual netmask for local subnet this node is connected to,
     * rather than looping through the entire Class C network.
     */
    new Netmask( self.interface.address, self.interface.netmask ).forEach( function( ip ) {
        for ( var port = self.port_scan_range[0]; port <= self.port_scan_range[1]; port += 1 ) {
            if ( !(ip === self.ip && port === self.port) ) {
                self.candidates.add( [ ip,':',port ].join('') );
            }
        }

    });

    self.state.set(
        self.key.with( self.salt ).make(),
        {
            state: 0,
            parameters: self.parameters,
            ip: self.ip,
            port: self.port
        }
    );

};

GlowNodeState.prototype.candidatesArray = function() { return this.candidates.toArray(); };

GlowNodeState.prototype.valid = function( salt, md5key ) {
    if ( this.key.with( salt ).test( md5key ) ) {

        if ( this.state.get( md5key, false) ) {

            return true;

        }

    }

    return false;
};

GlowNodeState.prototype.update = function( payload ) {

    this.state.set(
        payload.key,
        {
            state: payload.state,
            parameters: payload.parameters,
            ip: payload.ip,
            port: payload.port
        }
    );

    return this;
};

GlowNodeState.prototype.purge = function( ip, port ) {

    this.state = this.state.filter( function( value ) {
        return value.ip !== ip || value.port !== port;
    });

    return this;
};

module.exports = GlowNodeState;
