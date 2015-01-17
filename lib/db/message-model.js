// Mongoose User Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  to: { type: String, required: true },
  toName: { type: String, required: true },
  from: { type: String, required: true },
  fromName: { type: String, required: true },
  listing: {type: Schema.Types.ObjectId, ref: 'Listing' },
  listingTitle: { type: String, required: true },
  thread: { type: Array, required: true },
  context: { type: String },
  respondToken: String,
  dateSent: Date,
  dateRead: Date
});

MessageSchema.pre('save', function(next) {
  now = new Date();
  this.dateSent = now;
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
