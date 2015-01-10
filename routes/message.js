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


/*Send a Message Page */
router.get('/send', function(req, res) {
  console.log(req);
  res.render('message/message', {
    user: req.user,
    rcpt: req.rcpt
  });
});
router.post('/send', function(req, res) {
  var messageInfo = req.body;
  console.log(messageInfo);
  var userId = messageInfo.userId;
  // create a user a new user
  /*async.waterfall([
    function(done) {

    },
    function(userInfo, done) {
      var newMessage = new Message({
        to: messageInfo.to,
        from: messageInfo,
        listing: { type: String, required: true },
        message: { type: String, required: true },
        dateSent: { type: Date, required: true },
        dateRead: Date,
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
        activationToken: token,
        active: false
      });
      newUser.save(function(err, user) {
        var newUser = user;
        done(err, token, newUser, 'done');
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
      }, function(error, response, body){
        console.log(body);
      });
      /*request.post(url+ options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body) // Print the body of response.
        }
      });
    }], function(err, newUser) {
      //if (err) return next(err);
      if (err) {
        console.log(err);
        res.status(409).send(err);
      } else {
        res.status(200).send(newUser.email);
      }
    }
  );*/

  /*NAME
  MESSAGE
  TOEMAIL -
  FROMNAME
  FROMEMAIL
  RESPONDLINK
  LISTINGNAME
  LISTINGLINK
  */
});


/* POST Check if Email exists. */
router.post('/email-check', function(req, res){
  if (res.req.query.email) {
    db.users.find({email:res.req.query.email}).count(function(err, response) {
      console.log(response);
      if (response == '0') {
        res.status('email is available').send('false').end();
      } else {
        res.status('email is in use').send('true').end();
      }

    });
  } else {
    res.send('email required');
  }
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
