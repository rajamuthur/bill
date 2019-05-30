const express = require('express');
var user = require('../controllers/user-controller');
var utilities = require('../../common/utilities');

module.exports = function (router) {
    router.get('/users/', utilities.verifyToken, user.getAllUser);
    router.get('/user/:id', utilities.verifyToken, user.getUser);
    router.get('/user/budget/:id', utilities.verifyToken, user.getUserBudgetById);
    router.post('/user/signup/', user.addUser);
    router.post('/user/add/', utilities.verifyToken, user.addUser);
    router.post('/user/:id', utilities.verifyToken, user.updateUser);
    router.post('/user/budget/:id', utilities.verifyToken, user.updateBudgetById);
    router.delete('/user/delete/:id', utilities.verifyToken, user.deleteUser);
    return router;
};