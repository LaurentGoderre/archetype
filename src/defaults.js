'use strict';

module.exports = applyDefaults;

const _ = require('lodash');
const mpath = require('mpath');
const shouldSkipPath = require('./util').shouldSkipPath;

function applyDefaults(obj, schema, projection) {
  _.each(Object.keys(schema._paths), path => {
    if (!('$default' in schema._paths[path])) {
      return;
    }
    if (shouldSkipPath(projection, path) || projection.$noDefaults) {
      return;
    }
    const _path = path.replace(/\.\$\./g, '.').replace(/\.\$$/g, '');
    const val = mpath.get(_path, obj);
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; ++i) {
        if (val[i] == null) {
          val[i] = handleDefault(schema._paths[path].$default, obj);
        }
      }
      mpath.set(_path, val, obj);
    } else if (val == null) {
      mpath.set(_path, handleDefault(schema._paths[path].$default, obj), obj);
    }
  });
}

function handleDefault(obj, ctx) {
  if (typeof obj === 'function') {
    return obj(ctx);
  }
  return obj;
}