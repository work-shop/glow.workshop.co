'use strict';

var extend = require('util-extend');

var cfg = require('./config.js');

var pkg = require('./package.json');

var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
    version: pkg.version,
    addHelp: true,
    description: 'Glow-node Process. Starting this process turns the local machine into a glow node in a local network. Each glow node is parameterized by a location and 4 real values that determine their pulse signature.'
});

parser.addArgument(
    ['-m', '--monitor'],
    {
        dest: 'monitor',
        help: 'String (Optional). A URI pointing to a monitor server for this node to attach to for monitoring purposes.',
        defaultValue: cfg.monitor
    }
);

parser.addArgument(
    ['-p', '--port'],
    {
        dest: 'port',
        help: 'Int (Optional). Port to run this node on. Defaults to 8000.',
        defaultValue: cfg.port
    }
);

parser.addArgument(
    ['-w', '--write-polling-interval'],
    {
        dest: 'writePollingInterval',
        help: 'Int (Optional). Specify the interval (in ms) at which to update the output interface. Defaults to 50.',
        defaultValue: cfg.writePollingInterval
    }
);

parser.addArgument(
    ['-r', '--read-polling-interval'],
    {
        dest: 'readPollingInterval',
        help: 'Int (Optional). Specify the interval (in ms) at which to read the input interface. Defaults to 50.',
        defaultValue: cfg.readPollingInterval
    }
);

parser.addArgument(
    ['-t', '--threshold'],
    {
        dest: 'threshold',
        help: 'Int (Optional). Specify the threshold value above which a sensor reading should be considered hot.',
        defaultValue: cfg.threshold
    }
);

parser.addArgument(
    ['--interface'],
    {
        dest: 'interface',
        help: 'String (Optional). Network gateway to attempt to use to connect to the network.',
        defaultValue: cfg.interface
    }
);

parser.addArgument(
    ['--serial-port'],
    {
        dest: 'serialPort',
        help: 'String (Optional). Serial Port to open for connection with Arduino.',
        defaultValue: cfg.serialPort
    }
);

parser.addArgument(
    ['--debug'],
    {
        nargs: 0,
        action: 'storeConst',
        dest: 'debug',
        help: 'Specify this flag to start the node in local debug mode. Note that this is independent of the monitor command.',
        constant: true,
        defaultValue: cfg.debug
    }
);

parser.addArgument(
    ['--dry-run'],
    {
        nargs: 0,
        action: 'storeConst',
        dest: 'dryrun',
        help: 'Specify this flag to ignore GPIO and feed random values instead of actual sensor data. Primarily for debugging.',
        constant: true,
        defaultValue: cfg.dryrun
    }
);

parser.addArgument(
    ['-k', '--key'],
    {
        dest: 'key',
        help: 'A secure string. This string is used as a passkey which authenticates this node into the network. It, along with the a salt, is used to identify this network node.',
        defaultValue: cfg.key
    }
);

parser.addArgument(
    ['-s', '--salt'],
    {
        dest: 'salt',
        help: 'A secure string. This string uniquely identifies this node. Along with the key, it authenticates this node into the network.',
        defaultValue: cfg.salt
    }
);

parser.addArgument(
    ['-A', '--sin-amplitude'],
    {
        dest: 'sin_amplitude',
        help: 'A real value. Represents the amplitude of the sin component associated with this node\'s pulse.',
        defaultValue: cfg.sin_amplitude
    }
);

parser.addArgument(
    ['-a', '--cos-amplitude'],
    {
        dest: 'cos_amplitude',
        help: 'A real value. Represents the amplitude of the cos component associated with this node\'s pulse.',
        defaultValue: cfg.cos_amplitude
    }
);

parser.addArgument(
    ['-F', '--sin-frequency'],
    {
        dest: 'sin_frequency',
        help: 'A real value. Represents the frequency of the sin component associated with this node\'s pulse.',
        defaultValue: cfg.sin_frequency
    }
);

parser.addArgument(
    ['-f', '--cos-frequency'],
    {
        dest: 'cos_frequency',
        help: 'A real value. Represents the frequency of the cos component associated with this node\'s pulse.',
        defaultValue: cfg.cos_frequency
    }
);

let configuration = extend(cfg, parser.parseArgs());

configuration.rpio = require('rpio');

module.exports = configuration;
