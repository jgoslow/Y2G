var config = require('../config'); // DB Config
var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users"];
var db = require("mongojs").connect(dbURL, collections);

var mongoose = require('mongoose'),
    passport = require('passport'),
    Message = require('../lib/db/message-model'),
    User = require('../lib/db/user-model'),
    Flag = require('../lib/db/flag-model'),
    Listing = require('../lib/db/listing-model');

/* GET users listing. */
router.get('/', function(req, res) {
  var distance = parseInt(req.query.radius),
      radius = 6371,
      lat = parseFloat(req.query.lat),
      lng = parseFloat(req.query.lng);

  //console.log(distance, lat, lng)

  // latitude boundaries
  var maxlat = lat + rad2deg(distance / radius),
      minlat = lat - rad2deg(distance / radius);
  // longitude boundaries (longitude gets smaller when latitude increases)
  var maxlng = lng + rad2deg(distance / radius / Math.cos(deg2rad(lat)));
      minlng = lng - rad2deg(distance / radius / Math.cos(deg2rad(lat)));

  //console.log('db vars: '+maxlat, minlat, maxlng, minlng);
  db.listings.find({'latLng.lat': {$gt : minlat, $lt: maxlat}, 'latLng.lng': {$gt : minlng, $lt: maxlng}})
  .select('-latLng,-location').limit(5000).exec(function(err, response) {
    if (err) return console.log(err);
    //console.log(response);
    res.send(response);
    //if (callback && typeof(callback) == "function") callback(response);
  });
});

module.exports = router;


/* GET New User page. */
router.get('/new', function(req, res) {
  var type = req.query.type;
  res.render('listings/new', {
    user: req.user,
    title: 'Add Listing',
    listingType: type
  });
});

/* GET New User page. */
router.get('/add', function(req, res) {
  var listingInfo = req.query
    , newLatLng = JSON.parse(decodeURI(listingInfo.latLng))

  listingInfo.typeInfo = {}
  async.waterfall([
    // Get Respond Message from DB and add message to thread
    function(done) {
      if (listingInfo.type == 'gardener') {
        listingInfo.typeInfo.bio = listingInfo.bio;
      } else if (listingInfo.type == 'space') {
        console.log('amount:'+listingInfo.amount)
        listingInfo.typeInfo.amount = listingInfo.amount;
      } else if (listingInfo.type == 'organic') {
      } else if (listingInfo.type == 'tools') {
      }
      done(null, listingInfo);
    },
    function(listingInfo, done) {
      console.log(listingInfo)
      var newListing = new Listing({
        owner: listingInfo.owner
        , ownerName: listingInfo.ownerName
        , type: listingInfo.type
        , typeFields: listingInfo.typeFields
        , title: listingInfo.title
        , description: listingInfo.description
        , location: listingInfo.location
        , preciseMarker: listingInfo.preciseMarker
        , city: listingInfo.city
        , state: listingInfo.state
        , zip: listingInfo.zip
        , latLng: {
          lat: newLatLng.lat
          , lng: newLatLng.lng
        }
        , active: true
      });

      newListing.save(function(err, listing) {
        if (err) done(err)
        if (listing) done(err, listing, 'done')
      });
    },
    ],
    function(err, listing) {
      console.log('listing saved..');
      console.log(err, listing);
      if (err) {
        console.log(err);
        res.status(409).send(err);
      } else {
        console.log(listing);
        res.status(200).send('success');
      }
    }
  ); // End Async
});


/* GET Flag Listing form. */
router.get('/flag', function(req, res) {
  res.render('listings/flag', {
    user: req.user,
    listing: req.query.id,
    listingTitle: req.query.title
  });
});
/* Flag listing. */
router.post('/flag', function(req, res) {
  var newFlag = new Flag({
    user: req.user.id,
    listing: req.body.listing,
    message: req.body.message
  });
  console.log(newFlag);
  newFlag.save(function(err, flag){
    if (err) {
      console.log(err);
      if (err == 'Error: This user has already flagged this listing') {
        res.status(200).send('duplicate');
      } else {
        res.status(400).send(err);
      }
    } else {
      console.log(flag);
      res.status(200).send('success');
    }
  });
});

/* GET Edit Listings Page. */
router.get('/edit', function(req, res) {
  res.render('listings/edit', {
    user: req.user
  });
});


function getListings(type, number, lat, lng, distance, res, callback) {
  radius = 6371,
  lat = lat,
  lng = lng;

  // latitude boundaries
  var maxlat = lat + rad2deg(distance / radius),
  minlat = lat - rad2deg(distance / radius);
  // longitude boundaries (longitude gets smaller when latitude increases)
  var maxlng = lng + rad2deg(distance / radius / Math.cos(deg2rad(lat)));
  minlng = lng - rad2deg(distance / radius / Math.cos(deg2rad(lat)));

  //console.log('db vars: '+maxlat, minlat, maxlng, minlng);
  //'latLng.lat': {$gt : minlat, $lt: maxlat}, 'latLng.lng': {$gt : minlng, $lt: maxlng}
  db.listings.find({}).limit(number, function(err, response) {
    if (err) return console.log(err);
    //console.log(response);
    if (callback && typeof(callback) == "function") callback(response);
  });
}

function rad2deg(angle) {
  return angle * 57.29577951308232;
}
function deg2rad(angle) {
  return angle * .017453292519943295;
}
