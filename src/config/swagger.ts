'use strict';

module.exports = function (app) {
    var swagger = require("swagger-node-express");
    var express = require('express');
    var _ = require('lodash');

    // Couple with Swagger module.
    swagger.setAppHandler(app);

    // set api info
    swagger.setApiInfo({
        title: "@kschloeg mean stack startup",
        description: "Mean stack startup",
        termsOfServiceUrl: "",
        contact: "kschloeg@gmail.com",
        license: "MIT",
        licenseUrl: ""
    });

    // Serve up swagger ui at /docs via static route
    var docs_handler = express.static(__dirname + '/../../node_modules/swagger-ui-lite/dist/');
    var docs_override = express.static(__dirname + './util/swagger/');
    console.log("  KIRK 10 " + __dirname);
    console.log("  KIRK 11 " + __dirname + '/../../src/util/swagger/');
    console.log("  KIRK 12 " + __dirname + '/../../node_modules/swagger-ui-lite/dist/');
    console.log("  KIRK 13 " + docs_override);

    app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
      console.log("  KIRK DOCS " + req.url);
      console.log("  KIRK DOCS " + JSON.stringify(_.keys(req)));
        if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
            res.writeHead(302, { 'Location' : req.url + '/' });
            res.end();
            return;
        }
        // take off leading /docs so that connect locates file correctly
        req.url = req.url.substr('/docs'.length);
        // Serve up our version of index.html
        if(req.url === '/') {
            return docs_override(req, res, next);
        }

        return docs_handler(req, res, next);
    });
};
