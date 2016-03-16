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

// NOTIFICATIONS

/**
 * GET /notifications?new=false&page=
 * Get the user's most recent notificatons
 * If new is passed as true only unseen notification are fetched
 */
router.get('/notifications', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  req.query.new = ('new' in req.query) ? req.query.new : false;

  var where = {};
  if (req.query.new) {
    where.seen = false;
  }

  var page = ('page' in req.query) ? parseInt(req.query.page) : 1;
      page = (page > 0) ? page : 1;

  Notification
    .find({
      user: req.user
    })
    .where(where)
    .skip((page-1)*20)
    .limit(20)
    .exec(function(err, notifications) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json({
        notification: notifications,
        page: page
      });
    });
});

/**
 * POST /notification/:notification/seen
 * Mark a notification as seen
 */
router.post('/nofitication/:notification/seen', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }
  if (post.domain.toString() != user.domain.toString()) {
    return res.status(403).json({ error: 'Not allowed to edit that notification' });
  }

  var notify = req.notification;

  notify.seen = true;
  notify.save(function(err) {
    if (err) {
      return res.status(400).json({ error: err });
    }
    res.json({
      message: 'Message seen',
      notification: notify
    })
  });
});

// POST ROUTES

/**
 * GET /home
 * Gets logged in user's boards, home posts, and other
 */
router.get('/home', function(req, res) {
  res.json({ user: { name: "God" } });
});

/**
 * POST /post
 * Make a post
 */
router.post('/post', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  req.assert('title', 'Please provide a title').notEmpty();
  req.assert('content', 'Please provide a description').notEmpty();
  req.assert('link', 'Please enter a valid URL').isURL({
    require_protocol: true
  });
  req.sanitize('title').escape();
  req.sanitize('content').escape();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).json(errors);
  }

  UserManager.getPrivateUser(req.user._id).then(function(user) {
    var post = new Post({
      title: req.body.title,
      content: req.body.content,
      link: req.body.link,
      user: user,
      domain: user.domain
    });

    post.save(function(err) {
      if (err) {
        return res.status(400).json({ error: err });
      }

      res.json({ post: post });
    });
  },
  function(err) {
    return res.status(400).json({ error: err });
  });
});

/**
 * GET /posts?sort=new|hot&page=
 * Get all posts for the users team
 */
router.get('/posts', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  var sort = {};
  req.query.sort = ('sort' in req.query) ? req.query.sort : 'new';
  req.query.sort = (['new','hot'].indexOf(req.query.sort) > -1) ? req.query.sort : 'new';
  if (req.query.sort == 'new') {
    sort.createdAt = -1
  }
  else if (req.query.sort == 'hot') {
    sort.score = 1;
  }

  var page = ('page' in req.query) ? parseInt(req.query.page) : 1;
      page = (page > 0) ? page : 1;

  // Find posts by req.user.domain
  UserManager.getPrivateUser(req.user._id).then(function(user) {
    Post.find({
      domain: user.domain
    })
    .sort(sort)
    .skip((page-1)*20)
    .limit(20)
    .select({
      user: 0
    })
    .populate('domain', {
      name: 1
    })
    .exec(function(err, posts) {
      if (err) {
        res.status(400).json({ error: 'Failed to find posts' });
      } else {
        res.json({
          posts: posts,
          page: page,
          sort: sort
        });
      }
    });
  }, function(err) {
    return res.status(400).json({ error: err });
  });
});

/**
 * GET /post/:post
 * Gets post and it's activities
 */
router.get('/post/:post', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  Post
    .findById(req.post._id)
    .select({
      user: 0
    })
    .exec(function(err, post) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json(post);
    });
});

/**
 * POST /post/:post/upvote
 * Upvote a post
 */
router.post('/post/:post/upvote', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  PostManager.upvote(req.post, req.user).then(function(data) {
    res.json(data);
  }, function(err) {
    res.status(400).json({ error: err });
  });
});

/**
 * POST /post/:post/downvote
 * Downvote a post
 */
router.post('/post/:post/downvote', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  PostManager.downvote(req.post, req.user).then(function(data) {
    res.json(data);
  }, function(err) {
    res.status(400).json({ error: err });
  });
});

module.exports = router;
