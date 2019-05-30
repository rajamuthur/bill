'use strict';
var env = process.env.NODE_ENV || 'dev';
/*
U can connect mongodb via UI tool like NoSQL booster
 [or]
Connect via cmd line::
 mongo "mongodb+srv://cluster0-3dcry.mongodb.net/event" --username raja
 password: iYM6rlXQ0uGmFMTL
*/
var config = {
    dev: {
        DB_SERVER: 'localhost',
        DB_PORT: '27017',
        DB_NAME: 'event',
        DB_USERNAME: 'raja',
        DB_PASSWORD: 'iYM6rlXQ0uGmFMTL'
    }, prod: {
        DB_SERVER: 'localhost',
        DB_PORT: '27017',
        DB_NAME: 'event',
        DB_USERNAME: 'raja',
        DB_PASSWORD: 'iYM6rlXQ0uGmFMTL'
    }
};

module.exports = config[env];