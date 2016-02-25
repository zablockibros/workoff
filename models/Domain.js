"use strict";

var mongoose = require('mongoose');

var domainSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, unique: true },
  user_count: { type: Number, default: 0 },
  post_count: { type: Number, default: 0 }
  
}, { timestamps: true });

domainSchema.index({ name: 1 });
domainSchema.set('autoIndex', false);

/**
 *  Hook functions
 */
domainSchema.pre('save', function(next) {
  var domain = this;

  next();
});

/**
 *  Helper functions
 */


var Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;
