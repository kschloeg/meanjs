import _ = require('lodash');
import async = require('async');
import express = require('express');
import http_status = require('http-status');
import route = require('../../../util/swagger/routes');

import {ProductManager, ProductInterface, Product, ProductStatus} from 'productts';

import ProductResponse = require('./ProductResponse');
import Permissions = require('../../permissions/Permissions');

class ProductController {
    @route({
        path: "/v1/product",
        method: "POST",
        body: { name: true }
    })
    public static createProduct(req:express.Request, res:express.Response) {
        var product_data: ProductInterface = new Product(<ProductInterface>req.body);
        product_data.status = ProductStatus.ACTIVE;

        ProductManager.helloWorld();

        async.auto({
            permissions: (cb) => Permissions.canCreate(product_data, cb),
            create: ['permissions', (cb) => ProductManager.create(product_data, cb)],
            // hydrate: ['create', (cb, results) => ProductHydrator.hydrateProduct(results.create, cb)],
            response: ['create', (cb, results) => cb(null, ProductResponse.formatProductResponse(results.create))]
        }, (err, results: any) => {
            if (err) {
                // return Check.sendError(res, err);
            }
            return res.json(results.response);
        });
    }

    @route({
        path: "/v1/product/{product_id}",
        method: "GET",
        query: { include_inactive: false }
    })
    public static getProductById(req:express.Request, res:express.Response) {
        var product_id = req.params.product_id;
        var include_inactive = req.query.include_inactive;

        ProductManager.helloWorld();

        async.auto({
            product: (cb) => ProductManager.findById(product_id, {include_inactive:include_inactive}, cb),
            permissions: ['product', (cb, results) => Permissions.canView(results.product, cb)],
            // hydrate: ['permissions', (cb, results) => ProductHydrator.hydrateProduct(results.product, cb)],
            response: ['permissions', (cb, results) => cb(null, ProductResponse.formatProductResponse(results.product))]
        }, (err, results: any) => {
            if (err) {
                // return Check.sendError(res, err);
            }
            return res.json(results.response);
        });
    }
}
export = ProductController;
