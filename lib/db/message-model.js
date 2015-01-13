// Mongoose User Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  to: { type: String, required: true },
  from: { type: String, required: true },
  listing: { type: String, required: true },
  message: { type: String, required: true },
  respondAddress: String,
  dateSent: Date,
  dateRead: Date
});

MessageSchema.pre('save', function(next) {
  now = new Date();
  this.dateSent = now;
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
