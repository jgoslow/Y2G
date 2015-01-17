var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');
var stylus = require('stylus');
var hash = require('pwd').hash;
var mongoose = require('mongoose');
var passport = require('passport');
var Message = require('./lib/db/message-model');
var request = require('request');
var nodemailer = require('nodemailer');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('passport');
var async = require('async');
var crypto = require('crypto');
var connect = require('connect');
var http = require('http');
var monk = require('monk');
var config = require('./config'); // DB Config
var connStr = 'mongodb://'+config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users"];


var mailin = require('mailin');
mailin.start({
  port: 25,
  disableWebhook: true // Disable the webhook posting.
});
mailin.on('authorizeUser', function(connection, username, password, done) {
  done(null, true);
  /*if (username == "johnsmith" && password == "mysecret") {
  done(null, true);
} else {
done(new Error("Unauthorized!"), false);
}*/
});
mailin.on('startMessage', function (connection) {
  /* connection = {
  from: 'sender@somedomain.com',
  to: 'someaddress@yourdomain.com',
  id: 't84h5ugf',
  authentication: { username: null, authenticated: false, status: 'NORMAL' }
}
}; */
console.log(connection);
});
mailin.on('message', function (connection, data, content) {
  console.log(data);
  var to;
  data.to.forEach(function(rcpt){
    if (rcpt.address.indexOf("messages.y2g.org") > -1) {
      to = String(rcpt.address).replace('@messages.y2g.org','');
    }
  });
  /* Do something useful with the parsed message here.
  * Use parsed message `data` directly or use raw message `content`. */
  async.waterfall([
    // Get Respond Message from DB and add message to thread
    function(done) {
      console.log(to);
      Message.findOne({respondToken: to}, function(err, message){
        message.thread.push({message:data.html});
        message.save( function(err, message) {
          done(err, message);
        });
      });
    },
    function(newMessage, done) {
      console.log(newMessage);
      var url = 'https://mandrillapp.com/api/1.0/messages/send-template.json'
      , options = require('./lib/email/message-reply')
      , rcpt
      ;

      options.message.subject = 'Re: Response to your listing: "' + newMessage.listingTitle + '"';
      options.message.from_email = newMessage.respondToken+'@messages.y2g.org';
      options.message.headers['Reply-To'] = newMessage.respondToken+'@messages.y2g.org';
      options.message.merge_vars[0].vars[1].content = newMessage.message; // MESSAGE
      options.message.merge_vars[0].vars[4].content = config.url+'messages/respond?token='+newMessage.responseToken; // RESPONDLINK
      options.message.merge_vars[0].vars[6].content = config.url+'?listing='+newMessage.listing; // LISTINGLINK
      options.message.merge_vars[0].vars[5].content = newMessage.listingTitle; // LISTINGTITLE

      if (newMessage.thread.length%2 == 0) { // Check who the recipient is based on number of messages
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
      } else {
        console.log('Message Reply Success!')
      }
    }
  ); // End Async
});


// Passport Funcs
passport.use(new LocalStrategy({
  usernameField: 'email'
},function(email, password, done) { // NOTE: Email is username
  console.log(email, password);
  User.findOne({ email: email }, function(err, user) {
    if (err) {
      return done(err);
    }
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// User Schema
User = require('./lib/db/user-model');

// open DB connection
mongoose.connect(dbURL, function(err) {
  if (err) throw err;
});

var app = module.exports = express(); // NEW - didn't have = module.exports
var connectApp = connect();

// middleware
app.disable('view cache');
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'The 1adsecret to the whole B$7sHod world is one thing',
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// routes
var routes = require('./routes/index');
account = require('./routes/account');
listings = require('./routes/listings');
messages = require('./routes/messages');
app.use('/', routes);
app.use('/account', account);
app.use('/listings', listings);
app.use('/messages', messages);


// NEW
// Session-persisted message middleware
/*app.use(function(req, res, next){
var err = req.session.error;
var msg = req.session.success;
delete req.session.error;
delete req.session.success;
res.locals.message = '';
if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
next();
});*/


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
