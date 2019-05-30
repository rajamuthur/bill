'use strict';

// Add access to the app and db objects to each route
module.exports = function (router) {
    return [
        require('./auth-route')(router),
        require('./category-route')(router),
        require('./user-route')(router),
        require('./bill-route')(router),
        require('./item-route')(router),
        require('./unit-route')(router)
    ];
};
