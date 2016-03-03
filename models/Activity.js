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
  object: { type: String, index: true },
  key: { type: mongoose.Schema.Types.ObjectId, index: true },
  type: { type: String, index: true },
  value: { type: String }

}, { timestamps: true });

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
