"use strict";

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
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
  name: { type: String, index: true }

}, { timestamps: true });

schema.set('autoIndex', false);

/**
 *  Hook functions
 */
schema.pre('save', function(next) {
  var random = this;
  this.wasNew = this.isNew;
  next();
});

schema.post('save', function(random, next) {
  if (random.wasNew) {

  }
  next();
});

/**
 *  Helper functions
 */

var RandomName = mongoose.model('RandomName', schema);

module.exports = RandomName;
