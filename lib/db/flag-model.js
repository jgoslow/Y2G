// Mongoose User Schema
var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var FlagSchema = new mongoose.Schema({
    user: String
  , listing: {type: Schema.Types.ObjectId, ref: 'Listing' }
  , message: String
  , date: Date
  , complete: Boolean
})


FlagSchema.pre('save', function(next) {
  var self = this;
  mongoose.models["Flag"].findOne({user:this.user, listing: this.listing}, function(err, listing){
    if(err) {
      next(err)
    } else if (listing) {
      self.invalidate("user","This user has already flagged this post")
      next(new Error("This user has already flagged this listing"))
    } else {
      now = new Date()
      self.date = now
      self.message = self.message.replace(/(<([^>]+)>)/ig,"")
      next()
    }
  })
});

module.exports = mongoose.model('Flag', FlagSchema)
