var request = require('request'),
  dbURL = "y2g:something2GROW4@localhost:27017/y2g",
  collections = ["listings", "users"],
  db = require("mongojs").connect(dbURL, collections);

// Google Maps Setup
var gm = require("googlemaps"),
  util = require("util");

var action = process.argv[2], // get/save/create/rand
  type = process.argv[3], // listings/user
  data = process.argv[4]; // data

switch (action) {
  case 'get':
    if (type == 'user') {

    } else if (type == 'listings') {
      var listingType = data,
        num = parseInt(process.argv[5]),
        lat = parseFloat(process.argv[6]),
        lng = parseFloat(process.argv[7]),
        dist = parseFloat(process.argv[8]);
      console.log(listingType, num, lat, lng, dist);
      getListings(listingType, num, lat, lng, dist);
    }
    break;
  case 'save':

    break;
  case 'create':

    break;
  case 'rand':
    if (type == 'user') {
      createUsers(data);
    } else if (type == 'listings') {
      createListings(data)
    } else if (type == 'address') {
      randAddress();
    }
    break;
  case 'geo':
    geoCode(type);
    break;
  case 'func':
    eval(type + '();');
    break;
}



function saveUser(userData, callback) {
  db.users.save({
    username: userData.username,
    email: userData.email,
    password: userData.password,
    sex: userData.gender
  }, function(err, saved) {
    if (err || !saved) console.log("User not saved");
    else console.log("User saved");
  });
  if (callback && typeof(callback) == "function") callback(userData);
}

function saveListings(listingsData, callback) {
  gm.geocode(randAddress(), function(err, data, text) {
    if (err) {
      console.log(err);
      return;
    }
    var latLng = data.results[0].geometry.location;
    randText(function(text) {
      db.listings.save({
        created: listingsData.registered,
        owner: listingsData.username,
        type: randType(),
        title: text.substr(20),
        description: text,
        address: listingsData.location.street,
        city: listingsData.location.city,
        state: listingsData.location.state,
        zip: listingsData.location.zip,
        imgData: {
          thumbs: [   
            {url: listingsData.picture.thumbnail}
          ],
          full: [
            {url: listingsData.picture.large}
          ]
        },
        latLng: latLng
      }, function(err, saved) {
        if (err || !saved) console.log("Listing not saved");
        else console.log("Listing saved");
        if (callback && typeof(callback) == "function") return callback(listingsData);
      });
    });
  });
}

function getUsers(filter, callback) {

}

function getListings(type, number, lat, lng, distance, callback) {
  var distance = distance * 1.6, // convert to KM
    radius = 6371,
    lat = lat,
    lng = lng;

  // latitude boundaries
  var maxlat = lat + rad2deg(distance / radius),
    minlat = lat - rad2deg(distance / radius);
  // longitude boundaries (longitude gets smaller when latitude increases)
  var maxlng = lng + rad2deg(distance / radius / Math.cos(deg2rad(lat)));
  minlng = lng - rad2deg(distance / radius / Math.cos(deg2rad(lat)));
  console.log(maxlat, minlat, maxlng, minlng);

  db.listings.find({
    type: type,
    'latLng.lat': {
      $gt: minlat,
      $lt: maxlat
    },
    'latLng.lng': {
      $gt: minlng,
      $lt: maxlng
    }
  }).limit(number, function(err, response) {
    if (err) return console.log(err);
    var listings = response;
    console.log(listings);
    if (callback && typeof(callback) == "function") callback(listings);
  });
}

function geoCode(data, callback) {
  gm.geocode(data, function(err, data) {
    if (!err) {
      console.log(data.results[0].geometry.location);
    }
  });
}


// Generic
// Create Site Listings
function createListings(num) {
  for (i = 0; i < parseInt(num); i++) {
    testListings(saveListings);
  }
}

function testListings(callback) {
    var user, listing;
    request({
      url: 'http://api.randomuser.me/',
      json: true,
    }, function(err, response, body) {
      user = body.results[0].user;
      if (callback && typeof(callback) == "function") callback(user);
    });
  }
  // Create Site Users
function createUsers(num) {
  for (i = 0; i < parseInt(num); i++) {
    testUsers(saveUser);
  }
}

function testUsers(callback) {
  var user;
  request({
    url: 'http://api.randomuser.me/',
    json: true,
  }, function(err, response, body) {
    user = body.results[0].user;
    if (callback && typeof(callback) == "function") callback(user);
  });
}

function randType() {
  var types = ['garden', 'gardener', 'tools', 'organic'];
  return types[Math.floor(Math.random() * types.length)];
}

function randText(callback) {
  var text;
  request({
    url: 'http://api.icndb.com/jokes/random?firstName=John&amp;lastName=Doe',
    json: true
  }, function(err, response, body) {
    if (err) console.log(err);
    var text = body.value.joke;
    if (callback && typeof(callback) == "function") callback(text);
  });
}

function randAddress(callback) {
  var street = ['market', '1st', '2nd', '3rd', '4th', '5th', '6th'],
    address = Math.floor(Math.random() * 50) + ' ' + street[Math.floor(Math.random() * street.length)] + ' st. san francisco ca';
  if (action == 'rand' && type == 'address') {
    console.log(address);
  }
  return address;
  if (callback && typeof(callback) == "function") callback(address);
}

function printData(data) {
  console.log(data);
}

function rad2deg(angle) {
  //  discuss at: http://phpjs.org/functions/rad2deg/
  // original by: Enrique Gonzalez
  // improved by: Brett Zamir (http://brett-zamir.me)
  //   example 1: rad2deg(3.141592653589793);
  //   returns 1: 180

  return angle * 57.29577951308232; // angle / Math.PI * 180
}

function deg2rad(angle) {
  //  discuss at: http://phpjs.org/functions/deg2rad/
  // original by: Enrique Gonzalez
  // improved by: Thomas Grainger (http://graingert.co.uk)
  //   example 1: deg2rad(45);
  //   returns 1: 0.7853981633974483

  return angle * .017453292519943295; // (angle / 180) * Math.PI;
}

function addOldListings() {
  db.listings.save({
    created: listings.registered,
    owner: listings.username,
    type: listings,
    title: text.substr(20),
    description: text,
    address: listingsData.location.street,
    city: listingsData.location.city,
    state: listingsData.location.state,
    zip: listingsData.location.zip,
    latLng: latLng
  }, function(err, saved) {
    if (err || !saved) console.log("Listing not saved");
    else console.log("Listing saved");
    if (callback && typeof(callback) == "function") return callback(listingsData);
  });
}
