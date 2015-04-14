var config = require('../config'); // DB Config
var express = require('express');
var router = express.Router();
var request = require('request');
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users"];
var db = require("mongojs").connect(dbURL, collections);

var mongoose = require('mongoose'),
    passport = require('passport'),
    Message = require('../lib/db/message-model'),
    User = require('../lib/db/user-model'),
    Listing = require('../lib/db/listing-model');

/* Main Account Page. */
router.get('/', function(req, res) {
  res.render('admin/index', {
    user: req.user,
    admin: new AdminCheck(req.user)
  })
});

/* Bulk Import Page. */
router.get('/bulk', function(req, res) {
  res.render('admin/bulk', {
    bodyClasses: 'page-wide',
    user: req.user,
    admin: new AdminCheck(req.user)
  })
});



module.exports = router;

var y2g = function(){}



/*  ROLES FUNCTIONS
    Roles are strings with the various role names
    So you can have multiple roles in one user such
    as 'listings users'.  This function checks for
    access to specific sections based on those roles
*/
function AdminCheck(user) {
  if (user) {
    this.access = checkRoles(user, ['admin', 'manager', 'listings', 'users', 'messages'])
    this.admin = checkRoles(user, ['admin'])
    this.manager = checkRoles(user, ['admin', 'manager'])
    this.listings = checkRoles(user, ['admin', 'manager', 'listings'])
    this.users = checkRoles(user, ['admin', 'manager', 'users'])
    this.messages = checkRoles(user, ['admin', 'manager', 'messages'])
  } else {
    return false
  }
}
function checkRoles(user, roles) {
  if (user.role) {
    if (roles.some(function(v) { return user.role.indexOf(v) >= 0; })) {
        return true
    } else {
      return false
    }
  } else {
    return false
  }
}
