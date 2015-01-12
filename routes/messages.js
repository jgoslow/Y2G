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
  console.log(req);
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

/* GET users listing. */
router.get('/users/', function(req, res) {
  db.users.find({}).limit(5000, function(err, response) {
    res.send(response);
  });
});


module.exports = router;
