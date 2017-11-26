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
    'writePollingInterval': 50,
    /**
     * Int. The interval in milliseconds at which to update the output hardware.
     *
     */
    'readPollingInterval': 50,
    /**
     * Int in the range [0, 1024]. The threshold value above which the sensor(s) should be considered hot.
     */
    'threshold': 415,
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
    /**
     * String. Name of the TTY port to connect with.
     */
    'serialPort': '/dev/tty.usbmodem1421',
    /**
     * One of 110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200.
     * Sets the baud rate to initialize the serial connection at. MUST match the rate sets
     * on the FSR control Arduino.
     */
    'baudRate': 9600,
    /**
     * Object. Configuration Constants for Hardware.
     */
    'hardware': {
        'STARTUP_DELAY': 8000,
        'PWM': {
            /**
             * Power of 2. Internal divider that sets how frequently the PWM clock is checked.
             */
            'CLOCK_INTERVAL_DIVIDER': 8,
            /**
             * Power of 2. Maximum PWM pulse range.
             */
            'RANGE': 1024,
            /**
             * Power of 2. Maximum PWM usable pulse.
             */
            'MAX_INTERVAL': 128,
            /**
             * [1,40]. Physical pin header location for the R_Pin on the raspberry PI.
             * This pin controls the PWM for the red leds on the MOSFET driver
             */
            'R_PIN': 35,
            /**
             * [1,40]. Physical pin header location for the G_Pin on the raspberry PI.
             * This pin controls the PWM for the green leds on the MOSFET driver
             */
            'G_PIN': 33,
            /**
             * [1,40]. Physical pin header location for the B_Pin on the raspberry PI.
             * This pin controls the PWM for the blue leds on the MOSFET driver
             */
            'B_PIN': 32
        }
    }

};
