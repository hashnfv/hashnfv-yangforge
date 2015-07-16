// Generated by CoffeeScript 1.9.1

/*
YANG comlex-types module

The YANG complex-types module provides additional Yang language
extensions according to [RFC
6095](http://tools.ietf.org/html/rfc6095). These extensions provide
mechanisms to manage the `complex-type` schema definitions which
essentially allows a given YANG data schema module to describe more
than one data models and to build relationships between the data
models.
 */

(function() {
  var forge;

  forge = require('yangforge');

  module.exports = forge(module, function() {
    console.log('COMPLEX TYPE MAKER');
    this.extension('complex-type', function(key, value) {
      return this.compiler.define('complext-type', key, value);
    });
    this.extension('abstract', function(key, value) {
      return void 0;
    });
    this.extension('extends', function(key, value) {
      return this.merge((this.compiler.resolve('complex-type', key)).extend(value));
    });
    this.extension('instance-type', function(key, value) {
      return this.bind(key, (this.compiler.resolve('complex-type', key)).extend(value));
    });
    this.extension('instance', function(key, value) {
      return this.bind(key, yforge.Model.extend(value));
    });
    return this.extension('instance-list', function(key, value) {
      return this.bind(key, yforge.Array.extend({
        model: value
      }));
    });
  });


  /*
        @bind key, switch
          when (DS.Meta.instanceof (value.get? 'type')) then DS.BelongsTo.extend value
          else DS.Property.extend value
   */

}).call(this);