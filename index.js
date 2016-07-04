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
    setPaths   : function (paths) {
        this.paths = paths || [];
    },
    addPath    : function (path) {
        this.paths.push(path);
    },
    resolvePath: function (file) {
        file = file.replace(/^(\/|\.\/)/i, "");
        for (var i in this.paths) {
            var _path = path.join(this.paths[i], file);
            if (fs.existsSync(_path)) {
                return _path;
            }
        }

        throw new Error("Cannot resolve path: " + path);
    },
    require    : function (path) {
        try {
            var realPath = this.resolvePath(path);
            return require(realPath);
        } catch (e) {

            console.error(e);
            console.error(e.stack);

            throw new Error("Failed to require path:", path);
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

