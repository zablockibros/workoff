"use strict";

var RandomName = require('../RandomName');
var Q = require('q');
var _ = require('lodash');
var randoms = require('./randoms');

String.prototype.toCap = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Generate a random name
 */
exports.generate = function() {
  return randoms.adjectives[Math.floor(Math.random() * randoms.adjectives.length)].toCap() + randoms.nouns[Math.floor(Math.random() * randoms.nouns.length)].toCap();
};

/**
 * Generate a random name for a user commenting on a post, either make a new one or return the existing
 */
exports.generateForComment = function(post, user) {
  var def = Q.defer();
  var existingDef = Q.defer();

  // check models for existing usege of names in the and generate until you have a free one
  var name = false;

  // check for existing
  RandomName
    .findOne({
      user: user,
      post: post
    })
    .exec(function(err, existingRandomName) {
      if (err) {
        existingDef.reject(err);
      }
      else if (!existingRandomName) {
        existingDef.resolve();
      }
      else {
        def.resolve(existingRandomName, false);
      }
    });

  // find the currently used names list for this comment
  existingDef.promise.then(function() {
    RandomName
      .find({
        post: post
      })
      .where()
      .exec(function(err, savedNames) {
        if (err) {
          return def.reject(err);
        }
        while (name === false) {
          name = exports.generate();
          // if that name exists in the collection for the post
          if (_.find(savedNames, function(n){ n.name == name }) !== undefined) {
            name = false;
          }
        }
        def.resolve(name, true);
      });
  },
  function(err) {
    def.reject(err);
  });

  timeout(function(){
    def.reject('Failed to find a name in time');
  }, 5000);
  return def.promise;
};

/**
 * Save a random name for a user
 */
exports.saveNameForUser = function(user) {
  var def = Q.defer();

  var name = exports.generate();

  console.log(name);
  console.log(user);

  var randomName = new RandomName();
  randomName.name = name;
  randomName.user = user;

  randomName.save(function(err) {
    if (err) {
      return def.reject(err);
    }
    def.resolve(randomName);
  });

  return def.promise;
};

/**
 * Save a random name for a user posting a comment on a post
 * Saves no new record if one already exists
 */
exports.saveNameForComment = function(user, post) {
  var def = Q.defer();

  var name = exports.generateForComment(user, post).then(function(name, isNew) {
    // if isNew then name is an object
    if (!isNew) {
      return def.resolve(name);
    }

    var randomName = new RandomName({
      user: user,
      post: post,
      name: name
    });

    randomName.save(function(err) {
      if (err) {
        return def.reject(err);
      }
      def.resolve(randomName);
    });
  },
  function(err) {
    def.reject(err);
  });

  return def.promise;
};
