

var unitService = require('../services/unit-service');
const config = require('../../config');
const STATUS_CODE = config.APP_CONSTANTS.STATUS_CODE;
const async = require('async');
var unitController = {};
unitController.getAllUnit = getAllUnit;
unitController.deleteUnit = deleteUnit;
unitController.getUnitById = getUnitById;
unitController.updateUnit = updateUnit;
unitController.addUnit = addUnit;
module.exports = unitController;

// Get unit List
// POST /unit
// Output (Success): {"success":{"message":"Unit details."},"result":{"unit":{"address":{"address_line_1":"Impiger Technologies Pvt. Ltd.","address_line_2":"","city":"city","state":"state","zipcode":75632456},"contactInfo":{"primary_phone":1234567890,"alternate_phone":1234567891,"extension":738,"fax":"1-408-999 8888"},"privileges":[{"_id":"1","privilege":"View Dashboard"},{"_id":"2","privilege":"View Users"},{"_id":"3","privilege":"Edit User"},{"_id":"4","privilege":"Create Event"},{"_id":"5","privilege":"Edit Event"},{"_id":"6","privilege":"View Event"},{"_id":"7","privilege":"View Contribution"}],"_id":"5c8a5f8680923718b491374a","name":"admin","password":"admin","gender":"male","age":27,"email":"admin@imp.com","dob":"2019-03-14T14:04:54.976Z","imgPath":"admin.jpg","status":true,"regdate":"2019-03-14T14:04:54.976Z","date_updated":"2019-03-14T14:04:54.976Z","group":"customer","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWRtaW5AaW1wLmNvbSIsImlhdCI6MTU1MjY1NzUxM30.C9Qd8ZxiMUXiZxg8FfcWBRA9huOxyNYEmqy2WLFrs1A"}}}
// Output (Fail): {"error":{"message":"Failed to get unit details"}}
function getAllUnit(req, res, next) {
    async.waterfall([
        function (done) {
            unitService.getAllUnit().then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('getAllUnit err: ', err);
                done(err)
            });
        }
    ], function (err, unitData) {
        if (err) {
            console.log('getAllUnit err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('getAllUnit final Data: ', JSON.stringify(unitData));
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully  fetched all unit details.' }, result: { 'data': unitData } });
        }
    });
}

function deleteUnit(req, res) {
    unitService.deleteUnit(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully delete unit.' } });
    }).catch((err) => {
        console.log('deleteUnit err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

function getUnitById(req, res) {
    unitService.getUnitById(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched unit details.' }, result: { 'data': data} });
    }).catch((err) => {
        console.log('getUser err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

// Update unit details
// URL: http://localhost:3000/api/unit/5c8b98f83a4a254ae8f0f8c7/
// Request: {"name":"Veg","description":"Veg"}
// Response: {"success":{"message":"Successfully updated unit details."},"result":{"unit":true}}
function updateUnit(req, res) {
    let inputData = req.body;
    let unitId = req.params.id;
    async.waterfall([
        function (done) {
            if (!inputData.name) {
                done({ message: 'Name is required' });
            } else {
                done(null);
            }
        }, function (done) {
            unitService.isUnitExists(inputData.name, unitId).then(function (data) {
                console.log('updateUser isUnitExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('updateUser isUnitExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {           
            unitService.updateUnit(req.params.id, inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('updateUnit err: ', err);
                done(err);
            });
        }
    ], function (err, unitData) {
        if (err) {
            console.log('updateUnit err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('updateUnit data: ', unitData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully updated unit details.' }, result: { 'data': unitData } });
        }
    });
}

// Add new unit
// http://localhost:3000/api/unit/add/
// Request: {"name":"medical","description":"medical details"}
// Response: {"success":{"message":"Successfully created unit details."},"result":{"unit":{"_id":"5c94ac9d78afa81e8cf292d8","name":"medical","description":"medical details"}}
function addUnit(req, res) {
    let inputData = req.body;
    async.waterfall([
        function (done) {
            if (!inputData.name) {
                done({ message: 'Name is required' });
            } else {
                done(null);
            }
        }, function (done) {
            unitService.isUnitExists(inputData.name).then(function (data) {
                console.log('addUser isUnitExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('addUser isUnitExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            unitService.addUnit(inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('addUnit err: ', err);
                done(err);
            });
        }
    ], function (err, unitData) {
        if (err) {
            console.log('addUnit err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('addUnit data: ', unitData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully created unit details.' }, result: { 'data': unitData } });
        }
    });
}