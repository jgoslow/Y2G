var config = require('../config'); // DB Config
var express = require('express');
var router = express.Router();
var request = require('request');
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users"];
var db = require("mongojs").connect(dbURL, collections);
var moment = require('moment');

var mongoose = require('mongoose'),
    passport = require('passport'),
    Message = require('../lib/db/message-model'),
    User = require('../lib/db/user-model'),
    Listing = require('../lib/db/listing-model');

moment().format();

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
  db.listings.find({'latLng.lat': {$gt : minlat, $lt: maxlat}, 'latLng.lng': {$gt : minlng, $lt: maxlng}}).limit(5000, function(err, response) {
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
  var listingInfo = req.query,
      date = moment().format("YYYY-MM-DDTHH:mm:ssZ"),
      newCreated = moment().format("YYYY-MM-DDTHH:mm:ssZ"),
      newUpdated = moment().format("YYYY-MM-DDTHH:mm:ssZ"),
      newExpires = moment(date, "YYYY-MM-DDTHH:mm:ssZ").add(1, 'years').format("YYYY-MM-DDTHH:mm:ssZ"); //'YYYY-MM-DD hh:mma'
  var newLatLng = JSON.parse(decodeURI(listingInfo.latLng));
  var newListing = new Listing({
      owner: listingInfo.owner,
      ownerName: listingInfo.ownerName,
      type: listingInfo.type,
      title: listingInfo.title,
      description: listingInfo.description,
      location: listingInfo.location,
      city: listingInfo.city,
      state: listingInfo.state,
      zip: listingInfo.zip,
      created: newCreated,
      updated: newCreated,
      expires: newExpires,
      latLng: {
        lat: newLatLng.lat,
        lng: newLatLng.lng
      },
      active: true
  });

  newListing.save(function(err, listing) {
	console.log('listing saved..');
	console.log(err, listing);
    if (err) {
      console.log(err);
      res.status(409).send(err);
    } else {
      console.log(listing);
      res.status(200).send('success');
    }
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
