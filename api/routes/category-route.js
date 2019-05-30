const express = require('express');
var category = require('../controllers/category-controller');
var utilities = require('../../common/utilities');

module.exports = function (router) {
    router.get('/category/all', utilities.verifyToken, category.getAllCategory);
    router.get('/category/:id', utilities.verifyToken, category.getCategoryById);
    router.post('/category/add/', utilities.verifyToken, category.addCategory);
    router.post('/category/:id', utilities.verifyToken, category.updateCategory);
    router.delete('/category/delete/:id', utilities.verifyToken, category.deleteCategory);
    return router;
};