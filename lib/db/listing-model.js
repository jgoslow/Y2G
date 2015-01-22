// Mongoose User Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ListingSchema = new mongoose.Schema({
  owner: { type: String, required: true },
  ownerName: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  latLng: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  imgData: Array,
  created: { type: Date },
  updated: { type: Date },
  expires: { type: Date },
  active: { type: Boolean, required: true }
});

ListingSchema.pre('save', function(next) {
  now = new Date();
  this.updated = now;
  if ( !this.created ) {
    this.created = now;
  }
  this.title = this.title.replace(/(<([^>]+)>)/ig,"");
  this.description = this.description.replace(/(<([^>]+)>)/ig,"");
  next();
});

module.exports = mongoose.model('Listing', ListingSchema);
