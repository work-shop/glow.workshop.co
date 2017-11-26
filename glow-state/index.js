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

    this.log.printState( this.state );

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

    return this;
};

GlowNodeState.prototype.purge = function( ip, port ) {

    this.state = this.state.filter( function( value ) {
        return value.ip !== ip || value.port !== port;
    });

    return this;
};

/**
 * This routine maps the current state of the network into a set of
 * Three RGB oscillator values, which are implemented as hardware PWM intervals.
 *
 * @param t the current uptime of the system. This is used to produce the oscillation.
 * @return Object { r: Int, g: Int, b: Int }. Oscillators for R, G, and B, PWM, given the current network state.
 */
GlowNodeState.prototype.getOscillators = function( t ) {

    let state = this.get();

    let active_nodes = state.reduce( function( b,a ) { return b + a.state; }, 0);

    /**
     * These amplitude terms are used to balance the Red, Green, and Blue channels. Each should be in the range 0-1.
     * Additionally, the amplitude terms are functions of the current state of the system.
     * The amplitude is proportional to the ratio of active to total nodes.
     * The amplitude has a zero when no nodes are active. We correct for this switch
     * a small ground state term.
     */
    let a_factor = (active_nodes / state.length);

    let r_a = a_factor;
    let g_a = a_factor;
    let b_a = a_factor;

    /**
     * The frequency is proportional to the number of active nodes (with π as a normalizing term.)
     * positive adjustment to the denominator of the frequency term.
     */
    let f_factor = Math.PI * active_nodes;

    let r_f = f_factor;
    let g_f = f_factor;
    let b_f = f_factor;

    /**
     * These phase terms slide the range around in time.
     * The phase factors determine what the static ground state is. If ϕ = 0, then
     * the the ground stat is given as 0
     */
    let r_ph = 0;
    let g_ph = 0;
    let b_ph = 0;

    let r = r_a * Math.cos( r_f * t + r_ph );
    let g = g_a * Math.cos( g_f * t + g_ph );
    let b = b_a * Math.cos( b_f * t + b_ph );

    return {
        r: parseInt( Math.floor( this.map( r ) ) ),
        g: parseInt( Math.floor( this.map( g ) ) ),
        b: parseInt( Math.floor( this.map( b ) ) ),
    };
};

GlowNodeState.prototype.terminate = function() {
    this.log.write('message', 'state ', `Received polite quit request...`);
};

module.exports = GlowNodeState;
