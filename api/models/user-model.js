var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
        name: String,
        password: { type: String, required: true },
        gender: String,
        age: Number,
        imgPath: String,
        dob: Date,
        address: {
                address_line_1: String,
                address_line_2: String,
                city: String,
                state: String,
                zipcode: Number
        },
        email: { type: String, required: true },
        contactInfo: {
                primary_phone: Number,
                alternate_phone: Number,
                extension: Number,
                fax: String,
        },
        regdate: Date,
        date_updated: Date,
        group: String,
        privileges: Array,
        token: String,
        is_active: Boolean,
        total: {
                income: Number,
                split_up: Array
        }
}, { collection: 'user' });

// Compile model from schema
module.exports = mongoose.model('user', userSchema);
// module.exports = mongoose.model("Model", userSchema, 'user');