import _ = require('lodash');
import async = require('async');
import http_status = require('http-status');
import mongoose = require('mongoose');
import should = require('should');
import request = require('supertest');

import {ProductManager, ProductInterface, Product, ProductStatus} from 'productts';

import ExternalProductManager = require('./ExternalProductManager');
import ProductResponse = require('./ProductResponse');
import Permissions = require('../../permissions/Permissions');

var app: any = require("../../../server/app");

var product1 = new Product({ gid: 13860420, current_price: { value: 3.99, currency_code: "USD" } });

function createTestData(done: () => any) {
    async.auto({
        product1: (cb) => ProductManager.create(product1, cb)
    }, (err, results: any) => {
        should.not.exist(err);
        should.exist(results);
        should.exist(results.product1);
        product1 = results.product1;
        done();
    });
}

function cleanUpTestData(done: () => any) {
    ProductManager.removeById(product1.gid.toString(), done);
}

describe("Product API", () => {
    beforeEach(done => {
        createTestData(done);
    });

    afterEach(done => {
        cleanUpTestData(done);
    });

    describe("POST /v1/product/{id}", () => {
        var uri: string = "/v1/product/" + product1.gid.toString();

        it("should respond with an error for a conflict", done => {
            request(app)
                .post(uri)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(http_status.CONFLICT);
                    done();
                });
        });
    });

    describe("GET /v1/product/{id}", () => {
        var uri: string = "/v1/product/" + product1.gid.toString();

        it("should respond the product data for a valid id", done => {
            request(app)
                .get(uri)
                .end((err, res) => {
                    should.not.exist(err);
                    res.status.should.eql(http_status.OK);
                    var response = res.body;
                    should.equal(product1.gid, response.id);
                    done();
                });
        });
    });
});
