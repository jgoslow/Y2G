var config = require('../config'); // DB Config
var express = require('express');
var router = express.Router();
var request = require('request');
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users"];
var db = require("mongojs").connect(dbURL, collections);
var moment = require('moment');
var async = require('async');
var crypto = require('crypto');
var pass = require('pwd');
var url = require('url');
pass.iterations(13000);

var mongoose = require('mongoose'),
    passport = require('passport'),
    Message = require('../lib/db/message-model'),
    User = require('../lib/db/user-model'),
    Listing = require('../lib/db/listing-model');

/* Main Account Page. */
router.get('/', function(req, res) {
  res.send('account page');
});


/* GET Login Page. */
router.get('/login', function(req, res){
  res.render('account/login', {
    user: req.user
  });
});

/* POST Login. */
router.post('/login', function(req, res, next){
  console.log(req.body);

  passport.authenticate('local', function(err, user, info) {
    console.log(err, user, info);
    if (err) return next(err)
      if (!user) {
        return res.redirect('/account/login')
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.status(200).send('success!');
      });
    })(req, res, next);
    /*User.findOne({ email: req.body.email }, function(err, user) {
    if (err) throw err;
    console.log(user);

    // test a matching password
    user.comparePassword(req.body.password, function(err, isMatch) {
    if (err) throw err;
    //console.log(req.body.password, isMatch); // -&gt; Password123: true
    if (isMatch) {
    req.session.regenerate(function(){
    // Store the user's primary key
    // in the session store to be retrieved,
    // or in this case the entire user object
    req.session.user = user;
    req.session.success = 'Authenticated as ' + user.email
    + ' click to <a href="/logout">logout</a>. '
    + ' You may now access <a href="/restricted">/restricted</a>.';
    //res.status(202).send('You are now logged in');
    res.redirect('back');
  });
}
});
});*/
});

/* GET Logout Page. */
/*router.get('/logout', function(req, res){
// destroy the user's session to log them out
// will be re-created next request
req.session.destroy(function(){
res.redirect('/');
});
});*/
router.get('/logout', function(req, res){
  req.logOut();
  req.flash('info','you are now logged out');
  res.redirect('/')
});


/* GET New Account Page. */
router.get('/sign-up/', function(req, res) {
  res.render('account/signup', {
    title: 'Sign up for Y2G!',
    user: req.user
  });
});
/* Post New Account Page. */
router.post('/sign-up/', function(req, res) {
  var userInfo = req.body;
  // create a user a new user
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      var token = token;
      var newUser = new User({
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
        activationToken: token,
        active: false
      });
      newUser.save(function(err, user) {
        var newUser = user;
        done(err, token, newUser);
      });
    },
    function(token, newUser, done) {
      var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json';
      var options = require('../lib/email/confirmation');
      options.message.to[0].email = newUser.email;
      options.message.to[0].name = newUser.name;
      options.message.merge_vars[0].rcpt = newUser.email;
      options.message.merge_vars[0].vars[0].content = 'http://'+req.headers.host+'/account/activate/?token='+newUser.activationToken;
      options.message.merge_vars[0].vars[1].content = newUser.name;
      request.post({
        url:     url,
        form:    options
      }, function(err, response){
        done(err, response, 'done')
      });
    }
    ], function(err, response, body) {
      if (err) {
        console.log(err, response);
        res.status(409).send(err);
      } else {
        var email = JSON.parse(response.body)[0].email;
        res.status(200).send(email);
      }
    });

});

var gracefulExit = function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection with DB Closed');
  });
}

// If the Node process ends, close the Mongoose connection
//process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

/* GET Profile Page. */
router.get('/profile/', function(req, res) {
  res.render('account/profile', {
    user: req.user,
    title: 'View your Profile'
  });
});


/* GET Restricted Page. */
router.get('/restricted', restrict, function(req, res){
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});



/* GET Activation Page. */
router.get('/activate/', function(req, res) {
  User.findOne({ activationToken: req.query.token }, function(err, user) {
    if (!user) {
      req.flash('error', 'There has been an error - please try to login or recreate your account.');
      return res.redirect('/');
    } else {
      if (user.active == true) {
        req.flash('error', 'Your account is already activated, please login or request a password reset.');
        return res.redirect('/');
      } else {
        if (user.activationToken == req.query.token) {
          user.active = true;
          console.log(user);
          user.save(function(err, user) {
            req.logIn(user, function(err) {
              if (err) return next(err);
              req.flash('success', 'Your account is now active.  We went ahead and logged you in.');
              return res.redirect('/');
            });
          });
        } else {
          req.flash('error', 'There has been an error - please try to login or recreate your account.');
          return res.redirect('/');
        }
      }
    }
  });
});

/* RESET Password */
router.get('/forgot', function(req, res){
  res.render('account/forgot', {
    user: req.user
  });
});
/* RESET Password */
router.post('/forgot', function(req, res){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/account/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: '!!! YOUR SENDGRID USERNAME !!!',
          pass: '!!! YOUR SENDGRID PASSWORD !!!'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/account/forgot');
    });
});
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/account/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: '!!! YOUR SENDGRID USERNAME !!!',
          pass: '!!! YOUR SENDGRID PASSWORD !!!'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
    ], function(err) {
      res.redirect('/');
    });
  });



router.get('/user-test', function(req, res){
  mongoose.connect(dbURL, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
  });
  // create a user a new user
  var testUser = new User({
    name: 'jamar',
    email: 'jmar777@hello.com',
    password: 'Password'
  });

  // save user to database
  testUser.save(function(err) {
    if (err) throw err;
    if (err && (11000 === err.code || 11001 === err.code)) {
      // custom error message
      throw 'email already in use';
    }

    // fetch user and test password verification
    User.findOne({ email: 'jmar777@hello.com' }, function(err, user) {
      if (err) throw err;

      // test a matching password
      user.comparePassword('Password', function(err, isMatch) {
        if (err) throw err;
        console.log('Password:', isMatch); // -&gt; Password123: true
      });

      // test a failing password
      user.comparePassword('123Password', function(err, isMatch) {
        if (err) throw err;
        console.log('123Password:', isMatch); // -&gt; 123Password: false
      });
    });
  });
});

/* GET users listing. */
router.get('/users/', function(req, res) {
  db.users.find({}).limit(5000, function(err, response) {
    res.send(response);
  });
});


module.exports = router;

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

var y2g = function(){}
