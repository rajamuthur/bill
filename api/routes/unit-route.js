const express = require('express');
var unit = require('../controllers/unit-controller');
var utilities = require('../../common/utilities');

module.exports = function (router) {
    router.get('/unit/all', utilities.verifyToken, unit.getAllUnit);
    router.get('/unit/:id', utilities.verifyToken, unit.getUnitById);
    router.post('/unit/add/', utilities.verifyToken, unit.addUnit);
    router.post('/unit/:id', utilities.verifyToken, unit.updateUnit);
    router.delete('/unit/delete/:id', utilities.verifyToken, unit.deleteUnit);
    return router;
};