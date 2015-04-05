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
    OldUser = require('../lib/db/olduser-model'),
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
  //console.log(req.body);

  passport.authenticate('local', function(err, user, info) {
    console.log('error: ' +err)
    console.log('user: '+ user.name + ' - '+user.id)
    console.log('info: '+info)
    if (err) return next(err)
    if (!user) {
      return res.status(405).send('Wrong Username or Password');
    } else {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.status(200).send('success!');
      });
    }
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
      if (userInfo.createListing) options.message.merge_vars[0].vars[0].content = 'http://'+req.headers.host+'/account/activate/?token='+newUser.activationToken+'&createListing=true';
      else options.message.merge_vars[0].vars[0].content = 'http://'+req.headers.host+'/account/activate/?token='+newUser.activationToken;
      options.message.merge_vars[0].vars[1].content = newUser.name;
      request.post({
        url:     url,
        form:    options
      }, function(err, response){
        done(err, response, 'done')
      });
    }
    ], function(err, response) {
	  console.log(err, response);
      if (err) {
        console.log(err, response);
        res.status(409).send(err);
      } else {
        var email = JSON.parse(response.body)[0].email;
        res.status(200).send(email);
      }
    });

});


router.get('/delete', function(req, res) {
  res.render('account/delete', {
    title: 'Delete Account',
    user: req.user
  });
})

router.post('/remove', function(req, res) {
  var user = req.user
    , formInfo = req.body;
  console.log(formInfo)
  if (!user) res.send('You must be logged in to delete your account')
  console.log('id: ' +user.id)
  async.waterfall([
    function(done) {
      User.findOne({_id: user.id, active: true}, function(err, user){
        done(err, user)
      })
    },
    function(user, done) {
      user.remove()
      var activeUser = user
      var archive = new OldUser({
        _id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        reasons: user.reasons,
        bio: user.bio,
        masterGardener: user.masterGardener,
        deleteSurvey: [formInfo]
      })
      console.log(archive)
      archive.save(function(err, user) {
        var newUser = user;
        done(err, newUser);
      })
    }
  ], function(err, user) {
    console.log(err, user);
    if (err) {
      console.log(err, user);
      res.status(409).send(err);
    } else {
      req.logOut();
      req.flash('info','Your account has been removed and your listings de-activated.\n\n  Thanks for using Y2G!');
      res.redirect('/')
    }
  });
})


/*var gracefulExit = function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection with DB Closed');
  });
} */
// If the Node process ends, close the Mongoose connection
//process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

/* GET Profile Page. */
router.get('/profile/', function(req, res) {
  if (req.user) {
    res.render('account/profile', {
      user: req.user,
      title: 'View your Profile'
    })
  } else {
    res.render('account/login-required', {
      redirect: '/',
      message: 'You must login to view your profile.',
      title: 'View your Profile'
    })
  }
})

/* GET Profile Page. */
router.get('/profile-view', function(req, res) {
  User.findById(req.query.user, function(err, result){
    if(err) console.log(err)
    Listing.find({owner:req.query.user}, function(err, listings){
      if(err) console.log(err)
      res.render('account/profile-view', {
          user: result
        , requestUser: req.user
        , listingId: req.query.listingId
        , listingTitle: req.query.listingTitle
        , listings: listings
        , title: 'Profile for '+req.query.userName
      })
    })
  })

})


/* GET Restricted Page. */
router.get('/restricted', restrict, function(req, res){
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>')
})

/* Update Profile */
router.post('/updateItem', function(req, res) {
  var user = req.user
    , fieldName = String(req.body.field)
    , field = {}
  field[fieldName] = req.body.val

  console.log(field, fieldName, req.body.val, user.id);
  User.findByIdAndUpdate(user.id, field, function(err, user){
    console.log(err, user)
    if (err) res.status(404).send('user not found')
    if (user) res.status(200).send('success!')
  })

})
router.post('/updatePass', function(req, res) {
  var user = req.user
  , newPass = String(req.body.newPass)

  User.findById(user.id, function(err, user){
    user.password = newPass
    user.save(function(err, user){
      if (err) res.status(400).send(err)
      if (user) res.status(200).send(user)
    })
  })
})

/* GET Activation Page. */
router.get('/activate/', function(req, res) {
  var url = '/?account=confirmed'
  if (req.query.createListing) url = '/?account=confirmed&modal=new-listing'
  User.findOne({ activationToken: req.query.token }, function(err, user) {
    if (!user) {
      req.flash('error', 'There has been an error - please try to login or recreate your Account.');
      return res.redirect('/');
    } else {
      if (user.active == true) {
        req.flash('error', 'Your account is already activated, please login or request a password reset.');
        return res.redirect('/');
      } else {
        if (user.activationToken == req.query.token) {
          user.active = true;
          user.save(function(err, user) {
            req.logIn(user, function(err) {
              if (err) return next(err);
              console.log('createListing:'+req.query.createListing)
              req.flash('success', 'Your account is now active.  We went ahead and logged you in.\n\nNow you can create and edit listings!');
              return res.redirect(url);
            });
          });
        } else {
          console.log('createListing:'+req.query.createListing)
          req.flash('error', 'There has been an error - please try to login or recreate your Account.');
          return res.redirect('/');
        }
      }
    }
  });
});

/* RESET Password */
router.get('/forgot', function(req, res){
  res.render('account/forgot');
});
/* RESET Password */
router.post('/forgot', function(req, res){
  console.log(req.body)
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      console.log('find and update user')
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err) done(err)
        if (user) {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        } else {
          done(err)
        }
      });
    },
    function(token, user, done) {
      console.log('send email')
      var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json'
      var options = require('../lib/email/default')
      options.message.subject = 'Here\'s a link to reset your password!'
      options.message.to[0].email = user.email
      options.message.to[0].name = user.name
      options.message.tags[0] = 'password-reset'
      options.message.merge_vars[0].rcpt = user.email;
      options.message.merge_vars[0].vars[0].content = 'Password reset link from Y2G.org'
      options.message.merge_vars[0].vars[1].content = user.name
      options.message.merge_vars[0].vars[2].content = 'You are receiving this because you (or someone else) has requested to reset your password on Y2G.org.<br><br>' +
        'Please click on the following link, or paste this into your browser to complete the process:<br><br>' +
        'http://' + req.headers.host + '/account/reset/' + token + '<br><br>' +
        'If you did not request this, please ignore this email and your password will remain unchanged. The link will expire in an hour.<br>'

      request.post({
        url:     url,
        form:    options
      }, function(err, response){
        console.log(response)
        done(err, user.email, 'done')
      })
    }
    ], function(err, email) {
      if (err) res.status(400).send(err)
      res.status(200).send(email)
    });
});
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/?modal=profile');
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

/* GET users listing. */
router.get('/users/', function(req, res) {
  if (req.user.role != 'admin') res.status(500).send('You do not have permission to access this page.')
  db.users.find({}).limit(5000, function(err, response) {
    res.send(response);
  });
});

/* CSV of users' email */
router.get('/users/csv', function(req, res) {
  if (req.user.role != 'admin') res.status(500).send('You do not have permission to access this page.')
  User.find(function(err, response) {
    res.render('account/csv', {
      users: response,
      user: req.user
    });
  });
});
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}


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
