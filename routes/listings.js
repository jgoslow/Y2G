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

/* GET listings */
router.get('/', function(req, res) {
  var distance = parseInt(req.query.radius)
    , radius = 6371
    , lat = parseFloat(req.query.lat)
    , lng = parseFloat(req.query.lng)

  //console.log(distance, lat, lng)

  // latitude boundaries
  var maxlat = lat + rad2deg(distance / radius)
    , minlat = lat - rad2deg(distance / radius)
  // longitude boundaries (longitude gets smaller when latitude increases)
  var maxlng = lng + rad2deg(distance / radius / Math.cos(deg2rad(lat)))
    , minlng = lng - rad2deg(distance / radius / Math.cos(deg2rad(lat)))

  //console.log('db vars: '+maxlat, minlat, maxlng, minlng);
  Listing.find({'latLng.lat': {$gt : minlat, $lt: maxlat}, 'latLng.lng': {$gt : minlng, $lt: maxlng}})
  .select('-latLng -location').limit(5000).exec(function(err, response) {
    if (err) return console.log(err)
    //console.log(response);
    res.send(response)
    //if (callback && typeof(callback) == "function") callback(response);
  });
});
/* GET single listing. */
router.get('/single', function(req, res) {
  var id = req.query.id
  Listing.findById(id).select('-latLng -location').exec(function(err, listing){
    if (err) res.status(400).send(err)
    if (listing) res.status(200).send(listing)
  })
});

module.exports = router;


/* GET new listing form. */
router.get('/new', function(req, res) {
  var type = req.query.type;
  res.render('listings/new', {
    user: req.user,
    title: 'Add Listing',
    listingType: type
  });
});

/* Save the new listing */
router.get('/add', function(req, res) {
  var listingInfo = req.query
    , newLatLng = JSON.parse(decodeURI(listingInfo.latLng))
    , typeInfo = {}
  //console.log(listingInfo)
  async.waterfall([
    // Get Respond Message from DB and add message to thread
    function(done) {
      if (listingInfo.type == 'gardener') {
        typeInfo['gardenerBio'] = listingInfo.gardenerBio
      } else if (listingInfo.type == 'space') {
        typeInfo['squareMeters'] = listingInfo.squareMeters
      } else if (listingInfo.type == 'organic') {
      } else if (listingInfo.type == 'tools') {
      }
      done(null, listingInfo);
    },
    function(listingInfo, done) {
      var newListing = new Listing({
          owner: listingInfo.owner
        , ownerName: listingInfo.ownerName
        , type: listingInfo.type
        , typeFields: listingInfo.typeFields
        , title: listingInfo.title
        , description: listingInfo.description
        , location: listingInfo.address
        , preciseMarker: listingInfo.preciseMarker
        , city: listingInfo.city
        , state: listingInfo.state
        , zip: listingInfo.zip
        , latLng: {
            lat: newLatLng.lat
          , lng: newLatLng.lng
          }
        , typeInfo: []
        , publicListing: listingInfo.publicListing
        , active: true
      });
      newListing.typeInfo.push(typeInfo)
      for (i = 0; i < typeInfo.length; i++) {

      }

      newListing.save(function(err, listing) {
        console.log(err)
        if (err) done(err)
        if (listing) done(err, listing, 'done')
      });
    },
    ],
    function(err, listing) {
      console.log(listing)
      var listingInfo = {}
      listingInfo.latLng = listing.displayLatLng
      listingInfo.id = listing.id
      listingInfo.location = listing.location

      console.log('listing saved..');
      console.log(err, listing);
      if (err) {
        console.log(err);
        res.status(409).send(err);
      } else {
        console.log(listing);
        res.status(200).send(listingInfo);
      }
    }
  ); // End Async
});


/* Remove Listing */
router.get('/remove', function(req, res) {
  if (req.user) {
    Listing.findOneAndUpdate({id: req.listing},  function(listing){
      console.log(listing)
    })
  }
})

/* GET Flag Listing form. */
router.get('/flag', function(req, res) {
  res.render('listings/flag', {
      user: req.user
    , listing: req.query.id
    , listingTitle: req.query.title
  })
})
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
  if (req.user) {
    Listing.find({owner: req.user.id})
    .limit(5000).exec(function(err, listings) {
      console.log(listings)
      res.render('listings/edit', {
        listings: listings,
        user: req.user
      });
    })
  } else {
    res.render('listings/edit', {
      user: req.user
    });
  }
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
