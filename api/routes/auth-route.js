const express = require('express');
var user = require('../controllers/auth-controller');

module.exports = function (router) {
    router.post('/auth/login', user.validateUser);
    router.post('/auth/signup', user.signup);
    return router;
};