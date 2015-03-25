// Mongoose User Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var OldUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  location: String,
  reasons: String,
  bio: String,
  masterGardener: Boolean,
  deleteSurvey: Array,
  removed: Date
});

OldUserSchema.pre('save', function(next) {
  var user = this
  now = new Date()
  user.removed = now
  next()
});


module.exports = mongoose.model('OldUser', OldUserSchema);
