"use strict";

var Post = require('../Post');
var Activity = require('../Activity');
var Q = require('q');
var _ = require('lodash');

/* GETTERS */


/* SETTERS */

exports.upvote = function(post, user) {
  var def = Q.defer();

  // check that user and post share same domain
  if (post.domain.toString() != user.domain.toString()) {
    def.reject('User is not authorized to vote on that post');
    return def.promise;
  }

  // get the existing vote on this post for the user
  var activityDef = Q.defer();
  Activity
    .findOne({ user: user, post: post, type: "vote" })
    .exec(function(err, vote) {
      if (err) {
        return activityDef.reject('Failed to check votes');
      }

      if (!vote) {
        activityDef.resolve(new Activity());
      }
      else {
        activityDef.resolve(vote);
      }
    });

  // write the vote info
  var voteDef = Q.defer();
  activityDef.promise.then(function(vote) {
    vote.user = user;
    vote.post = post;
    vote.type = "vote";
    vote.value = 1;
    vote.save(function(err) {
      if (err) {
        return voteDef.reject(err);
      }
      voteDef.resolve(vote);
    });
  },
  function(err) {
    def.reject(err);
  });

  voteDef.promise.then(function(vote) {
      exports.updateScores(post).then(function(post) {
        def.resolve({
          vote: vote,
          post: post
        })
      },
      function(err) {
        def.reject(err);
      });
  },
  function(err) {
    def.reject(err);
  });

  return def.promise;
};

exports.downvote = function(post, user) {
  var def = Q.defer();

  // check that user and post share same domain
  if (post.domain.toString() != user.domain.toString()) {
    def.reject('User is not authorized to vote on that post');
    return def.promise;
  }

  console.log('Step 1');

  // get the existing vote on this post for the user
  var activityDef = Q.defer();
  Activity
    .findOne({ user: user, post: post, type: "vote" })
    .exec(function(err, vote) {
      if (err) {
        return activityDef.reject('Failed to check votes');
      }

      if (!vote) {
        activityDef.resolve(new Activity());
      }
      else {
        activityDef.resolve(vote);
      }
    });

  // write the vote info
  var voteDef = Q.defer();
  activityDef.promise.then(function(vote) {
    vote.user = user;
    vote.post = post;
    vote.type = "vote";
    vote.value = -1;
    vote.save(function(err) {
      if (err) {
        return voteDef.reject(err);
      }
      voteDef.resolve(vote);
    });
  },
  function(err) {
    def.reject(err);
  });

  voteDef.promise.then(function(vote) {
      exports.updateScores(post).then(function(post) {
        def.resolve({
          vote: vote,
          post: post
        })
      },
      function(err) {
        def.reject(err);
      });
  },
  function(err) {
    def.reject(err);
  });

  return def.promise;
};

exports.updateScores = function(post) {
  var def = Q.defer();

  Activity
    .find({ type: 'vote', post: post })
    .select({
      value: 1
    })
    .exec(function(err, votes) {
      if (err) {
        return def.reject('Failed to add up vote total');
      }
      var upvotes = _.reduce(votes, function(sum, vote) {
        return sum + ((vote.value > 0) ? 1 : 0);
      }, 0);
      var downvotes = _.reduce(votes, function(sum, vote) {
        return sum + ((vote.value < 0) ? 1 : 0);
      }, 0);
      var score = upvotes - downvotes;
      post.meta.score = score;
      post.meta.upvotes = upvotes;
      post.meta.downvotes = downvotes;
      post.save(function(err) {
        if (err) {
          return def.reject(err);
        }
        def.resolve(post);
      });
    });
  return def.promise;
};

exports.commentOn = function(post, user, content) {
  var def = Q.defer();

  // check that user and post share same domain
  if (post.domain.toString() != user.domain.toString()) {
    def.reject('User is not authorized to comment on that post');
    return def.promise;
  }

  var comment = new Activity({
    type: 'comment',
    value: 1,
    content: content,
    user: user,
    post: post
  });

  comment.save(function(err) {
    if (err) {
      def.reject(err);
    }
    def.resolve(comment);
  });

  return def.promise;
};
