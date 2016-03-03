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
  content: { type: String },
  date: { type: Date, default: Date.now },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  score: { type: Number, default: 0 },
  meta : {
    upvotes : Number,
    downvotes : Number,
    favs : Number
  }

}, { timestamps: true });

postSchema.set('autoIndex', false);

/**
 *  Hook functions
 */
postSchema.pre('save', function(next) {
  var post = this;
  post.score = 0;
  next();
});

/**
 *  Helper functions
 */


var Post = mongoose.model('Post', postSchema);

module.exports = Post;
