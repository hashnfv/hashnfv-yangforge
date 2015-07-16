// Generated by CoffeeScript 1.9.3
(function() {
  var YangCompiler, YangForge,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  YangCompiler = require('yang-compiler');

  YangForge = (function(superClass) {
    var fs, path;

    extend(YangForge, superClass);

    YangForge.set({
      extensions: {},
      methods: {}
    });

    YangForge.extension = function(name, func) {
      return this.set("extensions." + name + ".resolver", func);
    };

    YangForge.action = function(name, func) {
      return this.set("methods." + name, func);
    };

    path = require('path');

    fs = require('fs');

    function YangForge(input, func) {
      var compiler, config, err, forgery, output, pkgdir;
      if (this.constructor === Object) {
        assert(input instanceof (require('module')), "must pass in 'module' when forging a new module definition, i.e. forge(module)");
        if (module.loaded !== true) {
          module.exports = YangForge;
        }
        console.log("INFO: [forge] processing " + input.id + "...");
        try {
          pkgdir = path.dirname(input.filename);
          config = require(path.resolve(pkgdir, './package.json'));
          if (!(config.schema instanceof Object)) {
            config.schema = {
              path: config.schema,
              source: fs.readFileSync(path.resolve(pkgdir, config.schema), 'utf-8')
            };
          }
        } catch (_error) {
          err = _error;
          console.log("Unable to discover YANG schema for the target module, missing 'schema' in package.json?");
          throw err;
        }
        console.log("INFO: [forge] forging " + config.name + " (" + config.version + ") using schema from " + config.schema.path);
        forgery = (function(superClass1) {
          extend(_Class, superClass1);

          function _Class() {
            return _Class.__super__.constructor.apply(this, arguments);
          }

          _Class.merge(config);

          _Class.configure(func);

          return _Class;

        })(YangForge);
        compiler = new YangCompiler(forgery.extract('dependencies', 'extensions', 'methods'));
        output = compiler.compile(forgery.get('schema.source'));
        return forgery.merge(output);
      }
      YangForge.__super__.constructor.apply(this, arguments);
    }

    return YangForge;

  })(YangCompiler);

  module.exports = YangForge(module, function() {
    return this.action('import', function(input) {
      return this["import"](input);
    });
  });

}).call(this);