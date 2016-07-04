//3rd party
var Class = require("heritage").Class;

//node libs
var fs = require("fs"),
    path = require("path");

//Local vars
var instances = {};

var Manager = Class({
    initialize : function (config) {
        this.config = config;
        this.paths = config.paths || [];
    },
    resolvePath: function (path) {
        for (var i in this.paths) {
            var _path = path.join(this.paths[i], path);
            if (fs.existsSync(_path)) {
                return _path;
            }
        }

        throw new Error("Cannot resolve path: " + path);
    },
    requireFile: function (path) {
        try {
            var realPath = this.resolvePath(path);
            return require(realPath);
        } catch (e) {
            return null;
        }
    }
});

/**
 * Exports
 */
module.exports.getInstance = function (config, identifier) {
    if (!identifier) {
        identifier = "default";
    }

    if (!instances[identifier] && !config) {
        throw new Error("Cannot configure logger");
    }

    if (instances[identifier]) {
        return instances[identifier];
    }

    instances[identifier] = new Manager(config);
    return instances[identifier];
};

