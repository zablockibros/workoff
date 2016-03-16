"use strict";

var Activity = require('../Activity');
var Q = require('q');
var _ = require('lodash');

/* GETTERS */


/* SETTERS */

exports.upvote = function(comment, user) {
  var def = Q.defer();

  // get the existing vote on this comment for the user
  var activityDef = Q.defer();
  Activity
    .findOne({ user: user, type: "vote", parent: comment })
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
    vote.parent = comment;
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
      exports.updateScores(comment).then(function(comment) {
        def.resolve({
          vote: vote,
          comment: comment
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

exports.downvote = function(comment, user) {
  var def = Q.defer();

  // get the existing vote on this comment for the user
  var activityDef = Q.defer();
  Activity
    .findOne({ user: user, parent: comment, type: "vote" })
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
    vote.parent = comment;
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
      exports.updateScores(comment).then(function(comment) {
        def.resolve({
          vote: vote,
          comment: comment
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

exports.updateScores = function(comment) {
  var def = Q.defer();

  Activity
    .find({ type: 'vote', parent: comment })
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
      comment.meta.score = score;
      comment.meta.upvotes = upvotes;
      comment.meta.downvotes = downvotes;
      comment.save(function(err) {
        if (err) {
          return def.reject(err);
        }
        def.resolve(comment);
      });
    });
  return def.promise;
};

exports.commentOn = function(comment, user, content) {
  var def = Q.defer();

  // check that user and comment share same domain
  if (comment.domain.toString() != user.domain.toString()) {
    def.reject('User is not authorized to comment on that comment');
    return def.promise;
  }

  var comment = new Activity({
    type: 'comment',
    value: 1,
    content: content,
    user: user,
    comment: comment
  });

  comment.save(function(err) {
    if (err) {
      def.reject(err);
    }
    def.resolve(comment);
  });

  return def.promise;
};
