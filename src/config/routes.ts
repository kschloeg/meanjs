'use strict';
import _ = require('lodash');
import request = require('request-promise');
import ProductController = require('../api/v1/product/ProductController');

module.exports = function(app) {

    // Give AWS load-balancer health checks something to check against
    app.get('/healthcheck', function(req, res) {
        res.sendStatus(200);
    });

app.get('/hello', function(req, res) {
                  res.send({'ping': 'pong'});
                });
    app.get('/v1/product/:id', ProductController.getProductById);
    app.post('/v1/product/', ProductController.createProduct);

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|assets)/*')
        .get(function(req, res) {
            console.log(" Bad route: " + req.url);
            res.status(404).json(404);
        });
};

function getNWCContent(uri, res) {
    var options = {
        url: uri,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    request.get(options)
        .then(function(body) {
            res.send(parseJSON(body).mainContent);
        })
        .catch(function() {
            res.sendStatus(500);
        });
}

function parseJSON(json) {
    try {
        return JSON.parse(json);
    } catch (err) {
        return {};
    }
}
