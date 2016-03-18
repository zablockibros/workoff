"use strict";

var mongoose = require('mongoose');

var activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    index: true,
    default: null
  },
  object: { type: String, index: true, default: null },
  key: { type: mongoose.Schema.Types.ObjectId, index: true, default: null },
  type: { type: String, index: true },
  value: { type: Number, default: 0 },
  funnyName: { type: String },
  content: { type: String, default: null },
  meta : {
    comments: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    upvotes : { type: Number, default: 0 },
    downvotes : { type: Number, default: 0 },
    favs : { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }

}, { timestamps: true });

activitySchema.set('autoIndex', false);

/**
 *  Hook functions
 */
activitySchema.pre('save', function(next) {
  var post = this;
  this.wasNew = this.isNew;

  if (this.isNew && this.type === 'comment' && this.user && this.post) {
    next();
  }
  else {
    next();
  }
});

activitySchema.post('save', function(activity, next) {
  if (this.wasNew) {

  }
  next();
});

/**
 *  Helper functions
 */


var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
