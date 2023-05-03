//3rd party
var Class = require("heritage").Class,
    stackTrace = require("stack-trace"),
    _ = require("lodash");

//node libs
var fs = require("fs"),
    path = require("path");

//Local vars
if (!global.swagRequire) {
    global.swagRequire = {instances: {}};
}
var merge = function (a, b) {
    return _.mergeWith(a, b, function (a, b) {
        if (_.isArray(a) || _.isArray(b)) {
            return b;
        }
    });
};

var Manager = Class({
    initialize    : function (config) {
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
    requireMerged : function (file) {
        var paths = JSON.parse(JSON.stringify(this.paths));
        paths.reverse();

        file = file.replace(/^(\/|\.\/)/i, "");

        var final = {};
        for (var i in paths) {
            var _path = path.join(paths[i], file);
            if (fs.existsSync(_path)) {
                final = merge(final, require(_path));
            }
        }

        return final;
    },
    getIgnorePaths: function (file) {
        var ignores = JSON.parse(JSON.stringify(this.ignore));

        for (var i = 1; i < stackTrace.get().length; i++) {
            if (
                stackTrace.get()[i].getFileName() &&
                !stackTrace.get()[i].getFileName().match(/swag-require/ig) &&
                stackTrace.get()[i].getFileName().indexOf(file) >= 0
            ) {
                ignores.push(stackTrace.get()[i].getFileName());
                break;
            }
        }

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

    if (!global.swagRequire.instances[identifier] && !config) {
        throw new Error("Cannot configure dependency manager");
    }

    if (global.swagRequire.instances[identifier]) {
        return global.swagRequire.instances[identifier];
    }

    global.swagRequire.instances[identifier] = new Manager(config);
    return global.swagRequire.instances[identifier];
};
