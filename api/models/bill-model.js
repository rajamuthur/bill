var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var billsSchema = new Schema({
        name: String,
        display_name: String,
        amount: Number,
        purchased_date: Date,
        document_name: String,
        type: String,
        comments: String,
        created_by: String,
        _category: String, //Custom field for response alone
        _itemdetails: Array //Custom field for response alone  
}, { collection: 'bills' });

// Compile model from schema
module.exports = mongoose.model('bills', billsSchema);
// module.exports = mongoose.model("Model", billsSchema, 'category');