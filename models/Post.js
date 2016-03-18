"use strict";

var mongoose = require('mongoose');
var RandomNameManager = require('./managers/RandomNameManager');

var postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    index: true,
    default: null
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    index: true
  },
  public: { type: Boolean, default: true },
  type: { type: String, index: true },
  funnyName: { type: String },
  title: { type: String },
  link: { type: String, default: null },
  content: { type: String },
  date: { type: Date, default: Date.now },
  meta : {
    comments: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    upvotes : { type: Number, default: 0 },
    downvotes : { type: Number, default: 0 },
    favs : { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }

}, { timestamps: true });

postSchema.set('autoIndex', false);

/**
 *  Hook functions
 */
postSchema.pre('save', function(next) {
  var post = this;
  this.wasNew = this.isNew;

  if (this.isNew) {
    next();
  }
  else {
    next();
  }
});

postSchema.post('save', function(post, next) {
  if (post.wasNew) {

  }
  next();
});

/**
 *  Helper functions
 */

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
