import _ = require('lodash');
import async = require('async');
import express = require('express');
import http_status = require('http-status');

import {ProductManager, ProductInterface, Product, ProductStatus} from 'productts';

import ProductResponse = require('./ProductResponse');
import Permissions = require('../../permissions/Permissions');

class ProductController {
    //     path: "/v1/product/{id}",
    //     method: "POST",
    //     body: { name: false, current_price: false, status: false }
    public static create(req: express.Request, res: express.Response) {
        console.log("  KIRK create " + JSON.stringify(req.params));
        var id = req.params.id;
        if (Number.isNaN(+id)) {
            console.warn("Non-number product ID sent to create: " + id);
            return res.status(http_status.BAD_REQUEST).send({});
        }

        var product_data: ProductInterface = new Product(<ProductInterface>req.body);
        product_data.gid = req.params.id;

        async.auto({
            permissions: (cb) => Permissions.canCreate(product_data, cb),
            product: (cb) => ProductManager.findById(id, { include_inactive: true }, cb),
            create: ['permissions', 'product', (cb, results) => {
                if (results.product) {
                    var error: any = new Error("Conflict");
                    error.status = http_status.CONFLICT;
                    return cb(error, null);
                }
                ProductManager.create(product_data, cb);
            }],
            response: ['create', (cb, results) => cb(null, ProductResponse.formatProductResponse(results.create))]
        }, (err, results: any) => {
            console.log("    KIRK " + JSON.stringify(results.create));
            console.log("    KIRK " + JSON.stringify(results.response));
            if (err) {
                console.warn(err);
                return res.status(err.status || http_status.INTERNAL_SERVER_ERROR).send({});
            }
            return res.json(results.response);
        });
    }

    //     path: "/v1/product/{id}",
    //     method: "GET",
    //     query: { include_inactive: false }
    public static findById(req: express.Request, res: express.Response) {
        console.log("  KIRK findById " + JSON.stringify(req.params));
        var id = req.params.id;
        var include_inactive = req.query.include_inactive;

        async.auto({
            product: (cb) => ProductManager.findById(id, { include_inactive: include_inactive }, cb),
            permissions: ['product', (cb, results) => Permissions.canView(results.product, cb)],
            // hydrate: ['permissions', (cb, results) => ProductHydrator.hydrateProduct(results.product, cb)],
            response: ['permissions', (cb, results) => cb(null, ProductResponse.formatProductResponse(results.product))]
        }, (err, results: any) => {
            console.log("    KIRK " + JSON.stringify(id));
            console.log("    KIRK " + JSON.stringify(results.product));
            console.log("    KIRK " + JSON.stringify(results.response));
            if (err) {
                console.warn(err);
                return res.status(err.status || http_status.NOT_FOUND).send({});
            }

            if (!results.product) {
              return res.status(http_status.NOT_FOUND).send({});
            }

            return res.json(results.response);
        });
    }

    //     path: "/v1/product/{id}",
    //     method: "PUT",
    //     body: { name: false, current_price: false, status: false }
    public static update(req: express.Request, res: express.Response) {
        console.log("  KIRK update " + JSON.stringify(req.body));
        var id = req.params.id;
        var edits: {} = req.body;

        async.auto({
            product: (cb) => ProductManager.findById(id, { include_inactive: true }, cb),
            permissions: (cb, results) => Permissions.canEdit(results.product, cb),
            update: ['product', 'permissions', (cb, results) => {
              if (!results.product) {
                  var error: any = new Error("Not Found");
                  error.status = http_status.NOT_FOUND;
                  return cb(error, null);
              }
              ProductManager.update(results.product, edits, cb);
            }]
        }, (err, results: any) => {
            console.log("    KIRK " + JSON.stringify(id));
            console.log("    KIRK " + JSON.stringify(results.product));
            console.log("    KIRK " + JSON.stringify(results.response));
            if (err) {
                console.warn(err.status || err);
                return res.status(err.status || http_status.INTERNAL_SERVER_ERROR).send({});
            }
            return res.json({});
        });
    }
}
export = ProductController;
