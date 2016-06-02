/**
 * Express configuration
 */

'use strict';

import compression = require('compression');
import bodyParser = require('body-parser');
import methodOverride = require('method-override');

module.exports = function(app) {
    var env = app.get('env');
    console.log("config/express running in " + env);

    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '30mb' }));
    app.use(methodOverride());
};
