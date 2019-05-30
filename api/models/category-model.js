var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var categorySchema = new Schema({
        name: String,
        description: String
}, { collection: 'category' });

// Compile model from schema
module.exports = mongoose.model('category', categorySchema);
// module.exports = mongoose.model("Model", categorySchema, 'category');