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

router.get('/random', function(req, res) {
  res.json({ name: RandomNameManager.generate() });
});

// COMMENT ROUTES

/**
 * POST /post/:post/comment
 * Post a comment to a post
 */
router.post('/post/:post/comment', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  req.assert('content', 'Please provide a comment').notEmpty();
  req.sanitize('content').escape();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).json(errors);
  }

  PostManager.commentOn(req.post, req.user, req.body.content).then(function(data) {
    res.json(data);
  },
  function(err) {
    res.status(400).json({ error: err });
  });
});

/**
 * GET /post/:post/comments?page=
 * Get all root comments for a post
 */
router.get('/post/:post/comments', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  var sort = {};
  sort.createdAt = -1

  var page = ('page' in req.query) ? parseInt(req.query.page) : 1;
      page = (page > 0) ? page : 1;

  Activity
    .find({
      type: 'comment',
      post: req.post
    })
    .select({
      user: 0,
      post: 0,
      object: 0,
      key: 0,
      type: 0,
      value: 0
    })
    .sort(sort)
    .skip((page-1)*20)
    .limit(20)
    .exec(function(err, comments) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json({
        comments: comments,
        page: page
      })
    });
});

/**
 * POST /comment/:comment/upvote
 * Upvote a comment
 */
router.post('/comment/:comment/upvote', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  CommentManger.upvote(req.comment, req.user).then(function(data) {
    res.json(data);
  }, function(err) {
    res.status(400).json({ error: err });
  });
});

/**
 * POST /comment/:comment/downvote
 * Downvote a comment
 */
router.post('/comment/:comment/downvote', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  CommentManager.downvote(req.comment, req.user).then(function(data) {
    res.json(data);
  }, function(err) {
    res.status(400).json({ error: err });
  });
});

module.exports = router;
