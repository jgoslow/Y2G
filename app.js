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
var config = require('./config'); // Site Config Options
var connStr = 'mongodb://'+config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users", "oldusers"];
var compression = require('compression');

var cache = require('express-redis-cache')({
        host : config.redis.host,
        port : config.redis.port,
        expire : config.redis.expire,
        prefix : 'Y2G'
    })

//require('longjohn');

// Passport Funcs
passport.use(new LocalStrategy({
  usernameField: 'email'
},function(email, password, done) { // NOTE: Email is username
  console.log(email, password);
  User.findOne({ email: email.toLowerCase(), active: true }, function(err, user) {
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
app.disable(config.disable);
app.set('config', config);
app.set('cache', cache);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: require('mongoose-session')(mongoose)
  , resave: false // don't save session if unmodified
  , saveUninitialized: false // don't create session until something stored
  , secret: 'The 1adsecret to the whole B$7sHod world is one thing'
  , cookie: {
        expires: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000))
      , maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'))); // , { maxAge: oneDay } for caching


// error handlers
// Log all console.log requests to a file with user and date time
app.use(function(req, res, next){
  var fs = require('fs')
    , util = require('util')
    , log_file = fs.createWriteStream(__dirname + '/logs/console.log', {flags : 'a'})
    , log_stdout = process.stdout
    , userLogId = 'anonymous'
    , date = new Date()
  if (req.user) userLogId = 'user '+req.user.id
  var meta = '\n\n'+userLogId+' @ '+date

  console.log = function(d) { //
    var log_message = meta+'\n'+util.format(d) + '\n'
    fs.appendFile('logs/console.log', log_message, function (err) {
      if (err) throw err;
    });
    //log_file.write(log_message);
    log_stdout.write(util.format(d) + '\n');
  }
  next()
})

app.use(compression()); //use compression


// routes
var routes = require('./routes/index');
app.use('/', routes);
account = require('./routes/account');
app.use('/account', account);
listings = require('./routes/listings');
app.use('/listings', listings);
messages = require('./routes/messages');
app.use('/messages', messages);
admin = require('./routes/admin');
app.use('/admin', admin);


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
  cache.on('message', function(message){
      console.log(message)
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
