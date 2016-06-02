'use strict';
import _ = require("lodash");
import async = require("async");
import express = require('express');
import domain = require('domain');
import mongoose = require('mongoose');

// var config = require('kas-config');
// config.addEnvironmentValues(require('./config/environment'));
// config.addEnvironmentValues(require('./config/environment/' + process.env.NODE_ENV + ".js"));

require('source-map-support').install();

var app = express();

var server = null;

var mongo = {
    options: {
        server: {
            poolSize: 1
        },
        db: {
            safe: true
        }
    },
    debug: false,
    uri: 'mongodb://localhost:27017'
};

// Set default node environment to development
console.log('   KIRK 1: ' + JSON.stringify(mongo));
console.log('   KIRK ENV: ' + JSON.stringify(process.env));

process.env.NODE_ENV = 'development';
console.log('   ');
console.log('   KIRK KEYS: ' + JSON.stringify(_.keys(process)));
console.log('   KIRK CONFIG: ' + JSON.stringify(process.config));
console.log('   KIRK ENV: ' + JSON.stringify(process.env));
console.log('   ');
console.log('   ');

require('../config/express')(app);
require('../config/routes')(app);

// imports are finished. now begin starting up the app
async.auto({
    mongo: function(cb) { initMongo(mongo, cb); },
    mongoConfig: ['mongo', function(cb) { initMongoConfig(cb); }],
    server: ['mongoConfig', function(cb) { startServer(cb); }]
}, function(err) {
    if (err) {
        console.error(err);
    }
});

function initMongo(mongo, callback) {
    console.log('  KIRK connecting to mongo: ' + mongo.uri + ", " + JSON.stringify(mongo.options));
    mongoose.connect(mongo.uri, mongo.options, callback);
}

function initMongoConfig(callback) {
    if (mongo.debug) {
        mongoose.set('debug', function(coll, method, query, doc, options) {
            query = query || {};
            options = options || {};
            console.log('Mongoose: ' + coll + '.' + method + ' ' + JSON.stringify(query) + ' ' + JSON.stringify(options));
        });
    }
    process.nextTick(callback);
}

function startServer(callback) {
    var serverDomain = domain.create();
    serverDomain.on('error', function(err) {
        server.close(); // stop taking new requests
    });
    serverDomain.run(function() {
        server = require('http').createServer(app);
    });

    // Start server
    server.listen('8080', '127.0.0.1', function() {
        console.log('Startup Server: mode=' + JSON.stringify(app.path));
        console.log('   ');
        console.log('   KIRK APP KEYS: ' + JSON.stringify(_.keys(app)));
        console.log('   KIRK CONFIG: ' + JSON.stringify(process.config));
        console.log('   KIRK ENV: ' + JSON.stringify(process.env));
        console.log('   ');
        console.log('   ');
    });

    process.nextTick(callback);
}

// Expose app
module.exports = app;
