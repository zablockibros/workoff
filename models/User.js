"use strict";

var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Domain = require('./Domain');

var userSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, unique: true },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    index: true
  },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: String,
  twitter: String,
  google: String,
  github: String,
  instagram: String,
  linkedin: String,
  steam: String,
  tokens: Array,

  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' }
  }
}, { timestamps: true });

userSchema.set('autoIndex', false);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * Set the domain of the user
 */
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('email')) {
    return next();
  }

  var email = user.email || '';
  if (!email) {
    return next();
  }

  var domainName = email.replace(/.*@/, "");
  if (!domainName) {
    return next();
  }

  Domain
    .findOne({ name: domainName })
    .exec(function(err, domain) {
      if (err) {
        return next();
      }
      if (domain === null) {
        Domain.create({ name: domainName }, function(domainErr, newDomain) {
          if (err) {
            return next();
          }
          user.domain = newDomain;
          return next();
        });
      } else {
        user.domain = domain;
        return next();
      }
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};


var User = mongoose.model('User', userSchema);

module.exports = User;
