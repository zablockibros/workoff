var _ = require('lodash');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../../../config/passport');
var User = require('../../../models/User');
var Post = require('../../../models/Post');
var Domain = require('../../../models/Domain');
var Notification = require('../../../models/Notification');
var UserManager = require('../../../models/managers/UserManager');
var PostManager = require('../../../models/managers/PostManager');
var Activity = require('../../../models/Activity');
var RandomNameManager = require('../../../models/managers/RandomNameManager');
var express = require('express');
var router = express.Router();


/**
 * Establish params
 */
router.param('post', function(req, res, next, id) {
 Post.findOne({'_id' : id }, function(err, post) {
   if (err) {
     next(err);
   } else if (post) {
     req.post = post;
     next();
   } else {
     next(new Error('Could not find that post'));
   }
 });
});
router.param('comment', function(req, res, next, id) {
  Activity.findOne({'_id' : id, type: 'comment' }, function(err, post) {
    if (err) {
      next(err);
    } else if (post) {
      req.comment = comment;
      next();
    } else {
      next(new Error('Could not find that comment'));
    }
  });
});
router.param('domain', function(req, res, next, id) {
  Domain.findById(id, function(err, domain) {
    if (err) {
      next(err);
    } else if (domain) {
      req.domain = domain;
      next();
    } else {
      next(new Error('Could not find that domain'));
    }
  });
});
router.param('notification', function(req, res, next, id) {
  Notification.findById(id, function(err, notification) {
    if (err) {
      next(err);
    } else if (notification) {
      req.notification = notification;
      next();
    } else {
      next(new Error('Could not find that notification'));
    }
  });
});

// DOMAIN ROUTES

/**
 * GET /domains
 * Get a list of all domains
 */
router.get('/domains', function(req, res) {
  Domain
    .find()
    .exec(function(err, domains) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json(domains);
    });
});

/**
 * GET /domain/:domain
 * Get a domain by ID
 */
router.get('/domain/:domain', function(req, res) {
  res.json(req.domain);
});

/**
 * GET /domains?name=
 * Search for a domain
 */
router.get('/domains', function(req, res) {
  req.assert('name', 'Please provide a domain name to find').notEmpty();
  req.sanitize('name').escape();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).json(errors);
  }

  Domain
    .find({
      name: req.query.name
    })
    .exec(function(err, domains) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json(domains);
    });
});

/**
 * GET /domain/:domain/users
 * Get the domain users list
 */
router.get('/domain/:domain/users', function(req, res) {
  User
    .find({
      domain: req.domain
    })
    .select({
      email: 1,
      profile: 1
    })
    .exec(function(err, users) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json({
        users: users,
        domain: req.domain
      })
    })
});

/**
 * POST /invite
 * Invite a user via email
 */
router.post('/invite', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  res.json({});
});

module.exports = router;
