var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var unitSchema = new Schema({
        name: String
}, { collection: 'units' });

// Compile model from schema
module.exports = mongoose.model('units', unitSchema);
// module.exports = mongoose.model("Model", unitSchema, 'unit');