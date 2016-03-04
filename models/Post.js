"use strict";

var mongoose = require('mongoose');

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
  title: { type: String },
  link: { type: String, default: null },
  content: { type: String },
  date: { type: Date, default: Date.now },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  meta : {
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
  next();
});

/**
 *  Helper functions
 */

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
