"use strict";

var mongoose = require('mongoose');

var activitySchema = new mongoose.Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  object: { type: String },
  key: { type: mongoose.Schema.Types.ObjectId },
  type: { type: String },
  value: { type: String }

}, { timestamps: true });

activitySchema.index({ name: 1 });
activitySchema.set('autoIndex', false);

/**
 *  Hook functions
 */
activitySchema.pre('save', function(next) {
  var post = this;

  next();
});

/**
 *  Helper functions
 */


var Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
