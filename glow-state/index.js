'use strict';

var Netmask = require('netmask').Netmask;
var FastSet = require('collections/fast-set');
var SortedMap = require('collections/sorted-map');

var GlowNodeKey = require('../glow-key');
var getInterface = require('./interface.js');
var map = require('./linear-map.js');

var GlowNodeState = function( config, log ) {
    if (!(this instanceof GlowNodeState)) { return new GlowNodeState( config, log ); }
    var self = this;

    self.log = log;

    self.config = config;

    self.map = map( -1, 1 )( 0, config.hardware.PWM.MAX_INTERVAL );

    self.interface = getInterface( config, log );

    self.ip = self.interface.address;

    self.port_scan_range = config.port_scan_range;

    self.port = config.port;

    self.key = new GlowNodeKey( config.key, config.salt );

    self.salt = config.salt;

    self.local_state = 0;

    self.local_key = self.key.with( self.salt ).make();

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
     * This routine maps the current state of the network into a set of
     * Three RGB oscillator values, which are implemented as hardware PWM intervals.
     *
     * @param t the current uptime of the system. This is used to produce the oscillation.
     * @return Object { r: Int, g: Int, b: Int }. Oscillators for R, G, and B, PWM, given the current network state.
     */
    GlowNodeState.prototype.getOscillators = require('./oscillators-test.js')( self );

    /**
     * NOTE: Try hardcoding the valid IPs, for now.
     */

    self.addIPPair( '192.168.1.18', 8000 );
    self.addIPPair( '192.168.1.19', 8000 );
    self.addIPPair( '192.168.1.21', 8000 );

    /**
     * This routine should add valid candidates to the array.
     */
    // new Netmask( self.interface.address, self.interface.netmask ).forEach( function( ip ) {
    //     for ( var port = self.port_scan_range[0]; port <= self.port_scan_range[1]; port += 1 ) {
    //         if ( !(ip === self.ip && port === self.port) ) {
    //             self.candidates.add( [ ip,':',port ].join('') );
    //         }
    //     }
    //
    // });

    self.state.set(
        self.local_key,
        {
            state: 0,
            parameters: self.parameters,
            key: self.local_key,
            ip: self.ip,
            port: self.port
        }
    );

};

GlowNodeState.prototype.addIPPair = function( ip, port ) {
    if ( !(ip === this.ip && port === this.port) ) {
        this.candidates.add( [ ip, ':', port ].join('') );
    }

    return this;
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

/**
 * This routine reads the current state out of the HashMap.
 */
GlowNodeState.prototype.get = function() {

    return this.state.toArray();

};


GlowNodeState.prototype.updateSelf = function( binaryState ) {
    if ( this.local_state !== binaryState ) {

        this.log.write('message', 'state ', `New state value read from io:serial ${binaryState}`);

        this.local_state = binaryState;

        var newState = {
            state: binaryState,
            parameters: this.parameters,
            key: this.local_key,
            ip: this.ip,
            port: this.port
        };

        // this.parameters = this.parameters;

        this.state.set( this.local_key, newState );

        return newState;

    } else {

        return false;

    }
};


GlowNodeState.prototype.update = function( payload ) {

    this.state.set(
        payload.key,
        {
            state: payload.state,
            parameters: payload.parameters,
            key: payload.key,
            ip: payload.ip,
            port: payload.port
        }
    );

    this.log.printState( this.state );

    return this;
};

GlowNodeState.prototype.purge = function( ip, port ) {

    this.state = this.state.filter( function( value ) {
        return value.ip !== ip || value.port !== port;
    });

    return this;
};


GlowNodeState.prototype.terminate = function() {
    this.log.write('message', 'state ', `Received polite quit request...`);
};

module.exports = GlowNodeState;
