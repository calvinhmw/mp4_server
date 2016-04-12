// Load required packages
var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    name: String,
    dateCreated: { type: Date, default: Date.now }
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);
