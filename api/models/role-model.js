var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var roleSchema = new Schema({
        _id: String,
        privilege: { type: String},
        access: Array
}, { collection: 'role' });

// Compile model from schema
module.exports = mongoose.model('role', roleSchema);