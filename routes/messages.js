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
  res.send('account page', {
    user: req.user
  });
});


/*Send a Message Page */
router.get('/send', function(req, res) {
  console.log(req.query);
  res.render('messages/message', {
    user: req.user,
    listingTitle: req.query.listingTitle,
    listingId: req.query.listingId,
    to: req.query.owner,
    ownerName: req.query.ownerName,
  });
});
router.post('/send', function(req, res) {
  async.waterfall([
    function(done) { // If not a user, check Captcha
      var messageInfo = req.body,
          rc = messageInfo['g-recaptcha-response'],
          userId = messageInfo.userId;
          ip = req.connection.remoteAddress,
          secret = config.google.recaptcha,
          url = 'https://www.google.com/recaptcha/api/siteverify?secret='+secret+'&response='+rc+'&remoteip='+ip;
      if (req.user) {
        done(null, messageInfo);
      } else {
        request.post(url, function (err, response, body) {
          var passed = JSON.parse(body)["success"];
          if (passed == true) {
            console.log('new message: sender is human');
            done(err, messageInfo)
          } else {
            return res.status('406').send('You failed the captcha, please reload the page and try again');
          }
        });
      }
    },
    function(messageInfo, done) { // Get Sender User Info
      if (messageInfo.from.indexOf("@") > -1) { // If not logged in
        var sender = [];
        sender.email = messageInfo.from;
        sender.name = messageInfo.fromName;
        console.log('new message: get sender info');
        done(null, messageInfo, sender);
      } else {
        //console.log(messageInfo.from);
        User.findById(messageInfo.from, function(err, sender){
          //console.log(messageInfo);
          //console.log(user);
          console.log('new message: get sender info');
          done(err, messageInfo, sender);
        });
      }
    },
    function(messageInfo, sender, done) { // Get Sender User Info
      User.findById(messageInfo.to, function(err, rcpt){
        //console.log(messageInfo);
        //console.log(user);
        console.log('new message: get recipient info');
        done(err, messageInfo, sender, rcpt);
      });
    },
    function(messageInfo, sender, rcpt, done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        messageInfo.token = token;
        done(err, messageInfo, sender, rcpt, token);
      });
    },
    function(messageInfo, sender, rcpt, token, done) { // Creat and Save the new message
      if (messageInfo.phone) { sender.phone = messageInfo.phone; } // include phone if they've entered it
      if (!messageInfo.fromName) { messageInfo.fromName = ''; }
      var newMessage = new Message({
        to: rcpt.id, //rcpt.name + ' <' + rcpt.email + '>',
        from: messageInfo.from, //messageInfo.fromName + ' <' + messageInfo.from + '>',
        listing: messageInfo.listingTitle,
        message: messageInfo.message,
        respondAddress: token
      });
      newMessage.save(function(err, message){
        //console.log(message);
        console.log('new message: saved');
        done(err, messageInfo, sender, rcpt);
      });
    },
    function(messageInfo, sender, rcpt, done) { // Send Email and End Function
      //console.log(messageInfo);
      //console.log(sender);
      //console.log(rcpt);

      var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json';
      var options = require('../lib/email/message');
      options.message.from_name = sender.name;
      options.message.from_email = messageInfo.token+'@messages.y2g.org';
      options.message.subject = 'Response to your listing: "' + messageInfo.listingTitle + '"';
      options.message.to[0].email = rcpt.email;
      options.message.to[0].name = rcpt.name;

      options.message.headers['Reply-To'] = messageInfo.token+'@messages.y2g.org';
      options.message.merge_vars[0].rcpt = rcpt.email;

      options.message.merge_vars[0].vars[0].content = rcpt.name; // NAME
      options.message.merge_vars[0].vars[1].content = messageInfo.message; // MESSAGE
      options.message.merge_vars[0].vars[2].content = rcpt.email; // TOEMAIL
      options.message.merge_vars[0].vars[3].content = sender.name; // FROMNAME
      options.message.merge_vars[0].vars[4].content = config.url+'messages/respond?token='+messageInfo.token; // RESPONDLINK
      options.message.merge_vars[0].vars[5].content = messageInfo.listingTitle; // LISTINGTITLE
      options.message.merge_vars[0].vars[6].content = config.url+'?listing='+messageInfo.listingId; // LISTINGLINK
      
      if (sender.phone) { sender.phone = 'phone: '+sender.phone; } else { sender.phone = ''; }
      options.message.merge_vars[0].vars[7].content = sender.phone; // PHONE

      var postOpts = {
        url:     url,
        form:    options
      };

      request.post( postOpts, function(err, response){
        console.log('new message: sent');
        //console.log(response, rcpt.name);
        done(err, response, rcpt.name, 'done')
      });
    }
    ],
    function(err, response, name, body) {
      //if (err) return next(err);
      if (err) {
        console.log(err);
        res.status(409).send(err);
      } else {
        res.status(200).send(name);
      }
    }
  );
});

/* GET users listing. */
router.get('/users/', function(req, res) {
  db.users.find({}).limit(5000, function(err, response) {
    res.send(response);
  });
});


module.exports = router;
