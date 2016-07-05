//3rd party
var Class = require("heritage").Class,
    stackTrace = require("stack-trace");

//node libs
var fs = require("fs"),
    path = require("path");

//Local vars
var instances = {};

var Manager = Class({
    initialize    : function (config) {
        this.config = config;
        this.paths = config.paths || [];
        this.ignore = config.ignore || [];
    },
    setPaths      : function (paths) {
        this.paths = paths || [];
    },
    addPath       : function (path) {
        this.paths.push(path);
    },
    resolvePath   : function (file) {
        var ignores = this.getIgnorePaths(file);

        file = file.replace(/^(\/|\.\/)/i, "");
        for (var i in this.paths) {
            var _path = path.join(this.paths[i], file);

            var skip = false;

            for (var j in ignores) {
                if (_path.indexOf(ignores[j]) === 0 || _path == ignores[j]) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            if (fs.existsSync(_path)) {
                return _path;
            }
        }

        throw new Error("Cannot resolve path: " + file);
    },
    require       : function (path) {
        try {
            var realPath = this.resolvePath(path);
            return require(realPath);
        } catch (e) {

            console.error(e);
            console.error(e.stack);

            throw new Error("Failed to require path:" + path);
        }
    },
    getIgnorePaths: function (file) {
        var ignores = JSON.parse(JSON.stringify(this.ignore));
        ignores.push(stackTrace.get()[3].getFileName());
        return ignores;
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
        throw new Error("Cannot configure dependency manager");
    }

    if (instances[identifier]) {
        return instances[identifier];
    }

    instances[identifier] = new Manager(config);
    return instances[identifier];
};
