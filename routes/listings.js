var config = require('../config'); // DB Config
var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var dbURL = config.db.user+':'+config.db.pass+'@'+config.db.host+':'+config.db.port+'/'+config.db.db;
var collections = ["listings", "users"];
var db = require("mongojs").connect(dbURL, collections);
var app = require('../app');
var cache = app.get('cache');
var cacheCheck = function(req,res,next){
  if (!req.user) cache.prefix = 'Y2G:';
  else cache.prefix = 'Y2G-user:';
  console.log(Object.keys(req.session.flash))
  var flash = req.session.flash[Object.keys(req.session.flash)[0]]
  //console.log(req)
  console.log('flash:'+flash)
  if (flash) cache.prefix += 'flash('+flash+'):' //console.log(req.session.flash)
  next()
}

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
  Listing.find({'active': 'true', 'latLng.lat': {$gt : minlat, $lt: maxlat}, 'latLng.lng': {$gt : minlng, $lt: maxlng}})
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
  Listing.findById(id).select('-latLng -location -updated').exec(function(err, listing){
    if (err) res.status(400).send(err)
    if (listing) res.status(200).send(listing)
  })
});

/* Update single listing. */
router.post('/single/update', function(req, res) {
  var user = req.user
    , listingData = req.body
  console.log("listingData:")
  console.log(listingData)
  async.waterfall([
    function(done) {
      if (user) {
        Listing.findById(listingData.id).where('owner').equals(user.id)
        .exec(function(err, listing){
          done(err, listing)
        })
      } else {
        done('You must be logged in to delete a listing')
      }
    },
    function(listing, done) {
      // Update map locations based on address change
      done(null, listing)
    },
    function(listing, done) {
      listing.update(listingData).exec(function(err, listing){
        done(err, listing)
      });
    }
  ],
  function(err, listing){
    if (err) res.status(500).send(err)
    else res.status(200).send('listing '+listing.name+' updated successfully!')
  })

});

/* Remove single listing. */
router.post('/single/remove', function(req, res) {
  var id = req.body.id
    , survey = req.body
    , user = req.user
  console.log(id)
  if (user) {
    Listing.findOne({'_id': id}, function(err, listing){
      console.log(listing)
      if (err) {
        res.status(400).send(err)
      } if (listing.owner == user.id) {
        listing.deleteSurvey = survey
        listing.active = false
        listing.save(function(err){
          if (err) res.status(400).send('listing could not be removed')
          else res.status(200).send('listing '+listing.name+' removed successfully!')
        });
      } else {
        err.status(500).send('You do not have permission to remove this listing')
      }
    })
  } else {
    res.status(400).send('You must be logged in to delete a listing')
  }
});


/* GET new listing form. */
router.get('/new', cache.route(), function(req, res) {
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
      clearListingsCache()
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
      clearListingsCache();
      console.log(listing)
    })
  }
})

/* GET Flag Listing form. */
router.get('/flag', cache.route(), function(req, res) {
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
  var moment = require('moment')
  if (req.user) {
    Listing.find({owner: req.user.id, active: true})
    .limit(5000).exec(function(err, listings) {
      console.log(listings)
      res.render('listings/edit', {
        listings: listings,
        user: req.user,
        moment: moment
      });
    })
  } else {
    res.render('account/login-required',{
      message: 'You must login to edit listings',
      title: "Edit Listings",
      redirect: '/?modal=edit-listings'
    });
  }
});
/* GET Edit Single Listing Page. */
router.get('/edit-single', cache.route(), function(req, res) {
  var moment = require('moment')
    , listingId = req.query.id
  if (req.user) {
    Listing.findById(listingId)
    .exec(function(err, listing) {
      console.log('edit listing: '+listing.id)
      res.render('listings/edit-single', {
        listing: listing,
        user: req.user,
        moment: moment
      });
    })
  } else {
    res.render('account/login-required',{
      message: 'You must login to edit listings',
      title: "Edit Listings",
      redirect: '/?modal=edit-listings'
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


function clearListingsCache() {
  console.log('listings cleared')
  cache.del('Y2G:/listings*', function(){})
  cache.del('Y2G-user:/listings*', function(){})
  cache.del('Y2G:flash*', function(){})
}




module.exports = router;
