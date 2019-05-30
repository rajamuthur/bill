const express = require('express');
var bills = require('../controllers/bill-controller');
var utilities = require('../../common/utilities');

module.exports = function (router) {
    router.get('/bills/:id', utilities.verifyToken, bills.getBill);
    router.get('/bills/', utilities.verifyToken, bills.getAllBills);
    router.post('/bills/add/', utilities.verifyToken, bills.addBill);
    router.post('/bills/search/', utilities.verifyToken, bills.getBillsBySearch);
    router.post('/bills/:id', utilities.verifyToken, bills.updateBill);
    router.delete('/bills/delete/:id', utilities.verifyToken, bills.deleteBill);
    return router;
};