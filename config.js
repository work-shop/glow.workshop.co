'use strict';

var randomstring = require('randomstring');

module.exports = {
    /**
     * Maybe(String). Specify an external monitoring server to attach this node to.
     * if specified, this Glow Node will report state changes to the monitor as well
     * as the network nodes.
     */
    'monitor': false,
    /**
     * Int. Specify a port to mount this node on.
     */
    'port': 8000,
    /**
     * Array(2)<Int>. An integral interval specifying the low and high ends of the port band to scan on external hosts.
     * Note, this doesn't necesarily include the port this node is running on, but it can. If it does, this nodes port
     * will be excluded from the check.
     */
    'port_scan_range': [8000, 8010],
    /**
     * <int>. If the specified port doesn't work, how high should we climb before giving up?
     */
    'port_max_retries': 10,
    /**
     * Int. The interval in milliseconds at which to update the output hardware.
     *
     */
    'pollingInterval': 50,
    /**
     * Float. The threshold value above which the sensor(s) should be considered hot.
     *
     */
    'threshold': 0.5,
    /**
     * Real. Specify an amplitude for the sine component of this node's pulse.
     */
    'sin_amplitude': Math.random(),
    /**
     * Real. Specify a frequency for the sine component of this node's pulse.
     */
    'sin_frequency': Math.random(),
    /**
     * Real. Specify an amplitude for the cosine component of this node's pulse.
     */
    'cos_amplitude': Math.random(),
    /**
     * Real. Specify a frequency for the cosine component of this node's pulse.
     */
    'cos_frequency': Math.random(),
    /**
     * Bool. Specify whether to start the process in debug mode.
     */
    'debug': false,
    /**
     * String. A random key do identify this network. this key must be shared by
     * All nodes in the network, or they will not communicate.
     *
     * NOTE: This is a default key, which can and should be overridden at the command line.
     */
    'key': 'xvvgvyJiX8',
    /**
     * String. The name of the network bridge to use to connect to the local subnet.
     */
    'interface': 'en0',
    /**
     * String. A random salt to identify this node.
     */
    'salt': randomstring.generate( 5 ),
    /**
     * Bool. A flag specifying whether to use GPIO or fake it.
     *
     */
    'dryrun': false,

};
