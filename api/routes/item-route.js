const express = require('express');
var item = require('../controllers/item-controller');
var utilities = require('../../common/utilities');

module.exports = function (router) {
    router.get('/item/searchbyname', utilities.verifyToken, item.getAllItemByName);
    router.get('/item/all', utilities.verifyToken, item.getAllItem);
    router.get('/item/:id', utilities.verifyToken, item.getItemById);
    router.post('/item/add/', utilities.verifyToken, item.addItem);
    router.post('/item/:id', utilities.verifyToken, item.updateItem);
    router.delete('/item/delete/:id', utilities.verifyToken, item.deleteItem);
    return router;
};