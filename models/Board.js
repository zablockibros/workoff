"use strict";

var mongoose = require('mongoose');

var boardSchema = new mongoose.Schema({
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    index: true
  },
  public: { type: Boolean, default: true },
  type: { type: String, index: true },
  name: { type: String, index: true },
  date: { type: Date, default: Date.now },
  meta : {
    posts : Number
  }

}, { timestamps: true });

boardSchema.set('autoIndex', false);

/**
 *  Hook functions
 */
boardSchema.pre('save', function(next) {
  var board = this;

  next();
});

/**
 *  Helper functions
 */


var Board = mongoose.model('Post', boardSchema);

module.exports = Board;
