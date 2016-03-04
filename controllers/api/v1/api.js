var _ = require('lodash');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../../../config/passport');
var User = require('../../../models/User');
var UserManager = require('../../../models/managers/UserManager');
var Post = require('../../../models/Post');
var Activity = require('../../../models/Activity');
var express = require('express');
var router = express.Router();


/**
 * Establish params
 */
router.param('post', function(req, res, next, id) {
 Post.findOne( {'_id' : id }, function(err, post) {
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
  Activity.findOne( {'_id' : id, type: 'comment' }, function(err, post) {
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


// USER ROUTES

/**
 * POST /login
 * Login a user
 */
router.post('/login', function(req, res) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).json(errors);
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(400).json({ error: err });
    }
    if (!user) {
      return res.status(400).json({ error: info.message });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      return res.json({ msg: 'Success! You are logged in.' });
    });
  })(req, res);
});

/**
 * POST /signup
 * Signup
 */
router.post('/signup', function(req, res){
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    return res.json(errors);
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(400).json({ errors: ['Account with that email address already exists.'] });
    }
    user.save(function(err) {
      if (err) {
        return res.status(400).json({ error: err });
      }
      req.logIn(user, function(err) {
        if (err) {
          return res.status(400).json({ error: err });
        }
        res.json(user);
      });
    });
  });
});

/**
 * GET /account
 * Get the current logged in user
 */
router.get('/account', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }
  UserManager.getPrivateUser(req.user._id).then(function(user) {
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json(user);
  }, function(err){
    res.status(401).json({ error: err });
  });
});

/**
 * POST /account/update
 * Update a user account
 */
router.post('/account', function(req, res) {
 User.findById(req.user.id, function(err, user) {
   if (err) {
     return next(err);
   }
   user.profile.name = req.body.name || '';
   user.profile.gender = req.body.gender || '';
   user.profile.location = req.body.location || '';
   user.profile.website = req.body.website || '';
   user.save(function(err) {
     if (err) {
       return res.status(400).json({ error: err });
     }
     res.json(user);
   });
 });
});

/**
 * POST /logout
 * Logout the current user
 */
router.post('/logout', function(req, res) {
    req.logout();
    res.json({ message: 'You have been logged out' });
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
 * GET /posts?sort=new|hot&page=
 * Get all posts for the users team
 */
router.get('/posts', function(req, res) {
  var sort = {};
  req.query.sort = ('sort' in req.query) ? req.query.sort : 'new';
  req.query.sort = (['new','hot'].indexOf(req.query.sort) > -1) ? req.query.sort : 'new';
  if (req.query.sort == 'new') {
    sort.createdAt = -1
  }
  else if (req.query.sort == 'hot') {
    sort.score = 1;
  }

  var page = ('page' in req.query) ? parseInt(req.query.page) : 0;
      page = (page >= 0) ? page : 0;

  // Find posts by req.user.domain
  Post.find({
    domain: req.user.domain
  })
  .sort(sort)
  .skip(page*20)
  .limit(20)
  .exec(function(err, posts){
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
});

/**
 * GET /post/:post
 * Gets post and it's activities
 */
router.get('/post/:post', function(req, res) {
    res.json(req.post);
});

/**
 * POST /post
 * Make a post
 */
router.post('/post', function(req, res) {

});

/**
 * POST /post/:post/upvote
 * Upvote a post
 */
router.post('/post/:post/upvote', function(req, res) {

});

/**
 * POST /post/:post/downvote
 * Downvote a post
 */
router.post('/post/:post/downvote', function(req, res) {

});

/**
 * GET /post/:post/comments
 * Get all root comments for a post
 */
router.get('/post/:post/comments', function(req, res) {

});

/**
 * GET /post/:post/comment/:comment
 * Get all comment and sub comment data
 */
router.get('/post/:post/comments/:comment', function(req, res) {

});

/**
 * POST /post/:post/comment?commentId=
 * Post a comment to a post
 */
router.post('/post/:post/comment', function(req, res) {

});

module.exports = router;
