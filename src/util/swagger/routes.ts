import _ = require('lodash');
import async = require('async');
import express = require('express');
import http_status = require('http-status');

var router = express.Router();
var swagger = require("swagger-node-express");

function route(data:{path:string; method:string; body?:Object|boolean; query?:Object; notes?:string}) {
    return function (target, key, descriptor) {

      console.log("   KIRK 20 " + JSON.stringify(data));
      console.log("   KIRK 21 " + JSON.stringify(target));
      console.log("   KIRK 22 " + JSON.stringify(key));
console.log("   KIRK 23 " + JSON.stringify(descriptor));
console.log("   KIRK 24 " + JSON.stringify(this));

        var swaggerSpec = <any>{};
        swaggerSpec.path = data.path;
        swaggerSpec.method = data.method;

        swaggerSpec.nickname = key;
        swaggerSpec.notes = data.notes;
        swaggerSpec.parameters = [];

        // add path params to swagger
        var path_param_regex = /\{(.*?)\}/g;
        var path_param_match;
        while (path_param_match = path_param_regex.exec(data.path)) {
            swaggerSpec.parameters.push(swagger.params.path(path_param_match[1], "path param for " + key, "string"));
        }

        // add query params to swagger
        _.each(data.query, (required, queryParam) => {
            swaggerSpec.parameters.push(swagger.params.query(queryParam, "query param for " + key, "string", required));
        });

        // add body to swagger
        if (data.body) {
            var swaggerBodyExample = _.mapValues(data.body, value => { if (value) { return "required"; } return ""; });
            swaggerSpec.parameters.push(swagger.params.body("body", "The body for " + key, "string", JSON.stringify(swaggerBodyExample, undefined, 2), true));
        }

        switch(swaggerSpec.method.toUpperCase()) {
            case "GET":
                swagger.addGet({spec: swaggerSpec, action: function(req, res) {
                  res.send({'ping': 'pong'});
                }});
                break;
            case "POST":
                swagger.addPost({spec: swaggerSpec, action: target[key]});
            break;
            case "PATCH":
                swagger.addPatch({spec: swaggerSpec, action: target[key]});
            break;
            case "PUT":
                swagger.addPut({spec: swaggerSpec, action: target[key]});
                break;
            case "DELETE":
                swagger.addDelete({spec: swaggerSpec, action: target[key]});
                break;
            default:
                console.error("Did not match the REST verb", {verb: swaggerSpec.method.toUpperCase(), method: key });
                break;
        }
    }
}

export = route;
