"use strict";

var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  },
  title: { type: String },
  content: { type: String },
  date: { type: Date, default: Date.now },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  meta : {
    upvotes : Number,
    downvotes : Number,
    favs : Number
  }

}, { timestamps: true });

postSchema.index({ name: 1 });
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
