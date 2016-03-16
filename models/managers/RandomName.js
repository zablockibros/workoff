"use strict";

var RandomNAme = require('../RandomName');
var Q = require('q');
var _ = require('lodash');
var randoms = require('./randoms');

/**
 * Generate a random name
 */
exports.generate = function() {
  return randoms.adjectives[Math.floor(Math.random() * randoms.adjectives.length)] + randoms.nouns[Math.floor(Math.random() * randoms.nouns.length)];
};

/**
 * Generate a random name for a user commenting on a post
 */
exports.generateForComment = function(post, user) {
  var def = Q.defer();
  // check models for existing usege of names in the and generate until you have a free one
  var name = false;

  // find the currently used names list for this comment
  RandomName
    .find({
      user: user,
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
      def.resolve(name);
    });

  timeout(function(){
    def.reject('Failed to find a name in time');
  }, 5000);
  return def.promise;
};

/**
 * Save a random name for a user
 */
exports.makeNameForUser = function(user) {
  var def = Q.defer();

  var name = exports.generate();

  var randomName = new RandomName({
    user: user,
    name: name
  });

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
 */
exports.makeNameForComment = function(user, post) {
  var def = Q.defer();

  var name = exports.generateForComment(user, post).then(function(name) {
    var randomName = new RandomName({
      user: user,
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
