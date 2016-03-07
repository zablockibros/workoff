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
  object: { type: String, index: true, default: null },
  key: { type: mongoose.Schema.Types.ObjectId, index: true, default: null },
  type: { type: String, index: true },
  value: { type: Number, default: 0 },
  content: { type: String, default: null }

}, { timestamps: true });

activitySchema.set('autoIndex', false);

/**
 *  Hook functions
 */
activitySchema.pre('save', function(next) {
  var post = this;
  this.wasNew = this.isNew;
  next();
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
