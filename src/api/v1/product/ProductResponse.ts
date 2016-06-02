import _ = require('lodash');

import {ProductInterface} from "productts";

class ProductResponse {
    public static formatProductResponse(product:ProductInterface, options?:{hide_price:boolean}) {
        if (!product) {
            return null;
        }

        var response:any = {
            api_version: "v1",
            id: product.id,
            name: product.name,
            price: options && options.hide_price ? null : product.price,
            create_date: product.create_date,
            status: product.status
        };

        return response;
    }

    public static formatProductsResponse(products:ProductInterface[], options?:{hide_price:boolean}) {
      return products.map((product) => ProductResponse.formatProductResponse(product, options));

    }
}

export = ProductResponse;
