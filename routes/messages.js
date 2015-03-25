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
var parseReply = require('parse-reply');
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
        User.find({email: messageInfo.from}, function(err, user){
          //console.log(messageInfo);
          //console.log(user);
          sender = user;
          if (!err) console.log('new message: get sender info');
          done(err, messageInfo, sender);
        });
      }
    },
    function(messageInfo, sender, done) { // Get Sender User Info
      User.findById(messageInfo.to, function(err, rcpt){
        //console.log(messageInfo);
        //console.log(user);
        if (!err) console.log('new message: get recipient info');
        done(err, messageInfo, sender, rcpt);
      });
    },
    function(messageInfo, sender, rcpt, done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        messageInfo.token = token;
        done(err, messageInfo, sender, rcpt);
      });
    },
    function(messageInfo, sender, rcpt, done) { // Creat and Save the new message
      //if (messageInfo.phone) { messageInfo.message += '\n \n phone: ' + messageInfo.phone; } // include phone if they've entered it
      if (!messageInfo.fromName) { messageInfo.fromName = ''; }
      var newMessage = new Message({
        to: rcpt.email,
		    toName: rcpt.name,
        from: messageInfo.from,
		    fromName: sender.name,
		    subject: messageInfo.subject,
		    listing: messageInfo.listingId,
        listingTitle: messageInfo.listingTitle,
        thread: [
			   { message: messageInfo.message }
		    ],
        respondToken: messageInfo.token
      });
      newMessage.save(function(err, message){
        if (!err) console.log('new message: saved');
        done(err, message, messageInfo, sender, rcpt);
      });
    },
    function(newMessage, messageInfo, sender, rcpt, done) { // Send Email and End Function
      //console.log(messageInfo);
      //console.log(sender);
      //console.log(rcpt);

      var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json';
      var options = require('../lib/email/message');
      options.message.from_name = newMessage.fromName;
      options.message.from_email = newMessage.respondToken+'@messages.y2g.org';
      options.message.subject = newMessage.subject;
      options.message.to[0].email = newMessage.to;
      options.message.to[0].name = newMessage.toName;

      options.message.headers['Reply-To'] = newMessage.respondToken+'@messages.y2g.org';
      options.message.merge_vars[0].rcpt = newMessage.to;

      options.message.merge_vars[0].vars[0].content = newMessage.toName; // NAME
      options.message.merge_vars[0].vars[1].content = newMessage.thread[0].message; // MESSAGE
      options.message.merge_vars[0].vars[2].content = newMessage.to; // TOEMAIL
      options.message.merge_vars[0].vars[3].content = newMessage.fromName; // FROMNAME
      options.message.merge_vars[0].vars[4].content = config.url+'messages/respond?token='+newMessage.responseToken; // RESPONDLINK
      options.message.merge_vars[0].vars[5].content = newMessage.listingTitle; // LISTINGTITLE
      options.message.merge_vars[0].vars[6].content = config.url+'?listing='+newMessage.listing; // LISTINGLINK

      var postOpts = {
        url:     url,
        form:    options
      };

      request.post( postOpts, function(err, response){
        if (!err) console.log('new message: sent');
        //console.log(response, rcpt.name);
        done(err, response, rcpt.name, 'done')
      });
    }
    ],
    function(err, response, name) {
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
router.post('/reply/', function(req, res) {
  var replies = JSON.parse(req.body.mandrill_events);
  async.each(
    replies,
    function(reply, callback) {
      if (reply.event === 'inbound') {
        processReply(reply, callback);
      } else {
        callback();
      }
    },
    function(err) {
      if (err) {
        res.status(200).send(err);
      } else {
        res.status(200).send('success!');
      }

    }
  );
});


module.exports = router;


function processReply(reply, processCallback) {

  var to
    , emailObj = reply.msg
    , msg = parseReply(emailObj.text)
    //, msg = emailObj.text.split(emailObj.email)[0]
    , to = String(emailObj.email).replace('@messages.y2g.org','')
    , from = emailObj.from_email
    ;

  console.log(msg);

  async.waterfall([
    // Get Respond Message from DB and add message to thread
    function(done) {
      Message.findOne({respondToken: to}, function(err, message) {
        if (!message) {
          done('there was an error - no listings match');
        } else {
          done(err, message);
        }
      });
    },
    function(newMessage, done) {
      //console.log(newMessage);
      newMessage.thread.push({message:msg});
      newMessage.save( function(err, message) {
        done(err, message);
      });
    },
    function(newMessage, done) {
      //console.log(newMessage);
      var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json'
      , options = require('../lib/email/message-reply')
      , rcpt
      ;

      options.message.subject = 'Re: Response to your listing: "' + newMessage.listingTitle + '"';
      options.message.from_email = newMessage.respondToken+'@messages.y2g.org';
      options.message.headers['Reply-To'] = newMessage.respondToken+'@messages.y2g.org';
      options.message.merge_vars[0].vars[1].content = newMessage.thread[newMessage.thread.length-1].message; // MESSAGE
      options.message.merge_vars[0].vars[4].content = config.url+'messages/respond?token='+newMessage.responseToken; // RESPONDLINK
      options.message.merge_vars[0].vars[6].content = config.url+'?listing='+newMessage.listing; // LISTINGLINK
      options.message.merge_vars[0].vars[5].content = newMessage.listingTitle; // LISTINGTITLE

      if (newMessage.to == from) { // Check who the recipient is based on number of messages
        options.message.from_name = newMessage.toName;
        options.message.to[0].email = newMessage.from;
        options.message.to[0].name = newMessage.fromName;
        options.message.merge_vars[0].rcpt = newMessage.from;
        options.message.merge_vars[0].vars[0].content = newMessage.fromName; // NAME
        options.message.merge_vars[0].vars[2].content = newMessage.from; // TOEMAIL
        options.message.merge_vars[0].vars[3].content = newMessage.toName; // FROMNAME
        rcpt = newMessage.fromName;
      } else {
        options.message.from_name = newMessage.fromName;
        options.message.to[0].email = newMessage.to;
        options.message.to[0].name = newMessage.toName;
        options.message.merge_vars[0].rcpt = newMessage.to;
        options.message.merge_vars[0].vars[0].content = newMessage.toName; // NAME
        options.message.merge_vars[0].vars[2].content = newMessage.to; // TOEMAIL
        options.message.merge_vars[0].vars[3].content = newMessage.fromName; // FROMNAME
        rcpt = newMessage.toName;
      }

      var postOpts = {
        url:     url,
        form:    options
      };

      request.post( postOpts, function(err, response){
        console.log('new message: sent');
        //console.log(response, rcpt.name);
        done(err, response, rcpt, 'done')
      });
    }
    ],
    function(err, response, name) {
      //if (err) return next(err);
      if (err) {
        console.log(err);
        processCallback(err);
      } else {
        console.log('Message Reply Success!')
        processCallback();
      }
    }
  ); // End Async

}
