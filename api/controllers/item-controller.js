

var itemService = require('../services/item-service');
var billService = require('../services/bill-service');
const config = require('../../config');
var utilities = require('../../common/utilities');
const STATUS_CODE = config.APP_CONSTANTS.STATUS_CODE;
const async = require('async');
var itemController = {};

itemController.getAllItem = getAllItem;
itemController.getAllItemByName = getAllItemByName;
itemController.deleteItem = deleteItem;
itemController.getItemById = getItemById;
itemController.updateItem = updateItem;
itemController.addItem = addItem;
module.exports = itemController;

// Get item List by name
// POST /item/search?name=apple
// Output (Success): [{"units":["5ccfee941c9d440000291bde","5ccfee481c9d440000291bdd"],"_id":"5ccfed6b1c9d440000291bda","name":"apple","category":"5ccfe560e9be8c04d8853561","created_by":"5c94add9a7a56834f8529872","updated_by":"5c94add9a7a56834f8529872"}]
// Output (Fail): []
function getAllItemByName(req, res, next) {
    async.waterfall([
        function (done) {
            let isAdmin = req.user.group == 'admin' ? true : false;
            console.log('getAllItemByName req.user: ', req.user, 'isAdmin:', isAdmin);
            if (isAdmin) {
                done(null, []);
            } else {
                billService.getBillBySearch({ 'filter': { 'created_by': req.user.id } }).then(function (data) {
                    done(null, data);
                }).catch((err) => {
                    console.log('getBillBySearch err: ', err);
                    done({ msg: 'Failed to get item' })
                });
            }
        },
        function (itemData, done) {
            let name = req.query.name.toLowerCase();
            console.log('getAllItemByName itemData: ', itemData);
            let itemIds = utilities.getObjectIdsFromList(itemData, 'name', true);
            itemService.getAllItemByName(name, itemIds).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('getAllItemByName err: ', err);
                done(err)
            });
        }
    ], function (err, itemData) {
        if (err) {
            console.log('getAllItemByName err: ', err);
            if (err.code && err.code > 0) {
                return res.status(STATUS_CODE.SUCCESS).json([]);
            } else {
                return res.status(STATUS_CODE.SUCCESS).json([]);
            }
        } else {
            console.log('getAllItemByName final Data: ', JSON.stringify(itemData));
            return res.status(STATUS_CODE.SUCCESS).json(itemData);
        }
    });
}

// Get item List
// POST /item
// Output (Success): {"success":{"message":"Successfully  fetched all item details."},"result":{"item":[{"units":["5ccfee941c9d440000291bde","5ccfee481c9d440000291bdd"],"_id":"5ccfed6b1c9d440000291bda","name":"apple","category":"5ccfe560e9be8c04d8853561","created_by":"5c94add9a7a56834f8529872","updated_by":"5c94add9a7a56834f8529872"}]}}
// Output (Fail): {"error":{"message":"Failed to get item details"}}
function getAllItem(req, res, next) {
    async.waterfall([
        function (done) {
            itemService.getAllItem().then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('getAllItem err: ', err);
                done(err)
            });
        }
    ], function (err, itemData) {
        if (err) {
            console.log('getAllItem err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('getAllItem final Data: ', JSON.stringify(itemData));
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully  fetched all item details.' }, result: { 'data': itemData } });
        }
    });
}

function deleteItem(req, res) {
    itemService.deleteItem(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully delete item.' } });
    }).catch((err) => {
        console.log('deleteItem err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

function getItemById(req, res) {
    itemService.getItemById(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched item details.' }, result: { 'data': data } });
    }).catch((err) => {
        console.log('getUser err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

// Update Item details
// URL: http://localhost:3000/api/item/5c8b98f83a4a254ae8f0f8c7/
// Request: {"name":"apple","category":"5ccfe560e9be8c04d8853561","units":["5ccfee941c9d440000291bde","5ccfee481c9d440000291bdd"],"updated_by":"5c94add9a7a56834f8529872"}
// Response: {"success":{"message":"Successfully updated item details."},"result":{"item":true}}
function updateItem(req, res) {
    let inputData = req.body;
    let itemId = req.params.id;
    async.waterfall([
        function (done) {
            if (!inputData.name) {
                done({ message: 'Name is required' });
            } else if (!inputData.category) {
                done({ message: 'Category is required' });
            } else {
                inputData.name = inputData.name.toLowerCase();
                done(null);
            }
        }, function (done) {
            itemService.isItemExists(inputData.name, itemId).then(function (data) {
                console.log('updateUser isItemExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('updateUser isItemExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            itemService.updateItem(req.params.id, inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('updateItem err: ', err);
                done(err);
            });
        }
    ], function (err, itemData) {
        if (err) {
            console.log('updateItem err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('updateItem data: ', itemData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully updated item details.' }, result: { 'data': itemData } });
        }
    });
}

// Add new item
// http://localhost:3000/api/item/add/
// Request: {"name":"medical","description":"medical details"}
// Response: {"success":{"message":"Successfully created item details."},"result":{"item":{"_id":"5c94ac9d78afa81e8cf292d8","name":"medical","description":"medical details"}}
function addItem(req, res) {
    let inputData = req.body;
    console.log('addItem inputData: ', inputData);
    async.waterfall([
        function (done) {
            if (!inputData.name) {
                done({ message: 'Name is required' });
            } else {
                inputData.name = inputData.name.toLowerCase();
                done(null);
            }
        }, function (done) {
            itemService.isItemExists(inputData.name).then(function (data) {
                console.log('addItem isItemExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('addItem isItemExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            itemService.addItem(inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('addItem err: ', err);
                done(err);
            });
        }
    ], function (err, itemData) {
        if (err) {
            console.log('addItem err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('addItem data: ', itemData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully created item details.' }, result: { 'data': itemData } });
        }
    });
}