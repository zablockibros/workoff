var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
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
 * POST /password/forgot
 * Request a password reset token
 */
router.post('/password/forgot', function(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in!' });
  }

  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).json({ errors: erros });
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          return res.status(400).json({ error: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).json({ error: err });
    }
    res.json({ message: 'An e-mail has been sent to ' + req.user.email + ' with further instructions.' });
  });
});

/**
 * POST /password/reset/:token
 */
router.post('/password/reset/:token', function(req, res) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec(function(err, user) {
          if (err) {
            return res.status(400).json({ error: err });
          }
          if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save(function(err) {
            if (err) {
              return res.status(400).json({ error: err });
            }
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        done(err);
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).json({ error: err });
    }
    res.json({ message: 'Your password has been changed!' });
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

module.exports = router;
