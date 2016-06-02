import _ = require('lodash');
import async = require('async');

class Permissions {
    public static canCreate(something:any, callback:(err, permissions:boolean) => void) {
      callback(null, true);
    }

    public static canView(something:any, callback:(err, permissions:boolean) => void) {
      callback(null, true);
    }
}
export = Permissions;
