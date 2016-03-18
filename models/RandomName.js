"use strict";

var mongoose = require('mongoose');

var randomNameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    index: true,
    default: null
  },
  name: { type: String, index: true, default: null }

}, { timestamps: true });

randomNameSchema.set('autoIndex', false);


/**
 *  Helper functions
 */

var RandomName = mongoose.model('RandomName', randomNameSchema);

module.exports = RandomName;
