"use strict";

var User = require('../User');
var Q = require('q');

/**
 * Gets a returnable user to the logged in user
 */
exports.getPrivateUser = function(id, callback) {
  var def = Q.defer();
  User
    .findById(id)
    .select({
      email: 1,
      domain: 1,
      profile: 1
    })
    .populate('domain', {
      name: 1,
      post_count: 1,
      user_count: 1
    })
    .exec(function(err, user) {
      if (err) {
        return def.reject(err);
      }
      def.resolve(user)
    });
  return def.promise;
};

/**
 *  Gets a returnable public user data
 */
exports.getPublicUser = function(id, callback) {
  var def = Q.defer();
  User
    .findById(id)
    .select({
      email: 1,
      domain: 1,
      profile: 1
    })
    .populate('domain', {
      name: 1
    })
    .exec(function(err, user) {
      if (err) {
        return def.reject(err);
      }
      def.resolve(user)
    });
  return def.promise;
};
