"use strict";

var mongoose = require('mongoose');

var notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true,
    default: null
  },
  object: { type: String, index: true, default: null },
  key: { type: mongoose.Schema.Types.ObjectId, index: true, default: null },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  sent: { type: Date, default: null },
  seen: { type: Date, default: null }

}, { timestamps: true });

notificationSchema.set('autoIndex', false);

/**
 *  Hook functions
 */
notificationSchema.pre('save', function(next) {
  var post = this;

  next();
});

/**
 *  Helper functions
 */

var Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
