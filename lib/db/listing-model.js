// Mongoose User Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');
moment().format();

var ListingSchema = new mongoose.Schema({
    owner: { type: String, required: true }
  , ownerName: { type: String, required: true }
  , type: { type: String, required: true }
  , typeInfo: Array
  , title: { type: String, required: true }
  , description: { type: String, required: true }
  , location: { type: String, required: true, select: false }
  , preciseMarker: Boolean
  , city: { type: String, required: true }
  , state: { type: String, required: true }
  , zip: { type: String, required: true }
  , latLng: {
        lat: { type: Number, required: true, select: false }
      , lng: { type: Number, required: true, select: false }
    }
  , displayLatLng: {
        lat: { type: Number }
      , lng: { type: Number }
    }
  , imgData: Array
  , created: { type: Date }
  , updated: { type: Date }
  , expires: { type: Date }
  , active: { type: Boolean, required: true }
});

ListingSchema.pre('save', function(next) {
  this.displayLatLng = {}
  console.log(this.preciseMarker);
  if (this.preciseMarker != true) {
    this.preciseMarker = false
    // Calculate Display LatLng
    var r = 274/111300
      , y0 = this.latLng.lat
      , x0 = this.latLng.lng
      , u = Math.random()
      , v = Math.random()
      , w = r * Math.sqrt(u)
      , t = 2 * Math.PI * v
      , x = w * Math.cos(t)
      , y1 = w * Math.sin(t)
      , x1 = x / Math.cos(y0)
    this.displayLatLng.lat = y0 + y1
    this.displayLatLng.lng = x0 + x1
  } else {
    this.displayLatLng = this.latLng
  }

  now = new Date()
  expire = moment().add(1, 'years')
  console.log('now: '+now)
  console.log('expires: '+expire)
  this.updated = now
  this.expires = expire
  if ( !this.created ) {
    this.created = now
  }
  this.title = this.title.replace(/(<([^>]+)>)/ig,"")
  this.description = this.description.replace(/(<([^>]+)>)/ig,"")
  next()
});

module.exports = mongoose.model('Listing', ListingSchema);
