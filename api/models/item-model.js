var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var itemSchema = new Schema({
        name: String,
        category: String,
        is_approved: Boolean,
        units: Array,
        created_by: String,
        updated_by: String
}, { collection: 'items' });

// Compile model from schema
module.exports = mongoose.model('items', itemSchema);
// module.exports = mongoose.model("Model", itemSchema, 'item');