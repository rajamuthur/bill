

var userService = require('../services/user-service');
const config = require('../../config');
var utilities = require('../../common/utilities');
const STATUS_CODE = config.APP_CONSTANTS.STATUS_CODE;
const async = require('async');
var userController = {};
userController.getAllUser = getAllUser;
userController.deleteUser = deleteUser;
userController.getUser = getUser;
userController.updateUser = updateUser;
userController.updateBudgetById = updateBudgetById;
userController.addUser = addUser;
userController.getUserBudgetById = getUserBudgetById;
module.exports = userController;

// Get user List
// POST /users
// Output (Success): {"success":{"message":"User details."},"result":{"user":{"address":{"address_line_1":"Impiger Technologies Pvt. Ltd.","address_line_2":"","city":"city","state":"state","zipcode":75632456},"contactInfo":{"primary_phone":1234567890,"alternate_phone":1234567891,"extension":738,"fax":"1-408-999 8888"},"privileges":[{"_id":"1","privilege":"View Dashboard"},{"_id":"2","privilege":"View Users"},{"_id":"3","privilege":"Edit User"},{"_id":"4","privilege":"Create Event"},{"_id":"5","privilege":"Edit Event"},{"_id":"6","privilege":"View Event"},{"_id":"7","privilege":"View Contribution"}],"_id":"5c8a5f8680923718b491374a","name":"admin","password":"admin","gender":"male","age":27,"email":"admin@imp.com","dob":"2019-03-14T14:04:54.976Z","imgPath":"admin.jpg","status":true,"regdate":"2019-03-14T14:04:54.976Z","date_updated":"2019-03-14T14:04:54.976Z","group":"customer","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWRtaW5AaW1wLmNvbSIsImlhdCI6MTU1MjY1NzUxM30.C9Qd8ZxiMUXiZxg8FfcWBRA9huOxyNYEmqy2WLFrs1A"}}}
// Output (Fail): {"error":{"message":"Failed to get user details"}}
function getAllUser(req, res, next) {
    async.waterfall([
        function (done) {
            userService.getAllUser().then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('getAllUser authenticateUser err: ', err);
                done(err)
            });
        }
    ], function (err, userData) {
        if (err) {
            console.log('getAllUser err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('getAllUser final userData: ', JSON.stringify(userData));
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully  fetched all user details.' }, result: { 'data': userData } });
        }
    });
}

function deleteUser(req, res) {
    userService.deleteUser(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully delete user.' } });
    }).catch((err) => {
        console.log('deleteUser err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

function getUser(req, res) {
    userService.getUserById(req.params.id).then(function (data) {
        // data.password = utilities.
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched user details.' }, result: { 'data': data } });
    }).catch((err) => {
        console.log('getUser err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

// Update user details
// URL: http://localhost:3000/api/user/5c8b98f83a4a254ae8f0f8c7/
// Request: {"email":"rr@imp.com","gender":"Female","is_active":true,"name":"admin","password":"admin","age":30,"contactInfo":{"primary_phone":"9876543452","alternate_phone":"00000"},"dob":"2018-12-24"}
// Response: {"success":{"message":"Successfully updated user details."},"result":{"user":true}}
function updateUser(req, res) {
    let inputData = req.body;
    let userId = req.params.id;
    async.waterfall([
        function (done) {
            if (!inputData.email) {
                done({ message: 'Email is required' });
            } else if (!inputData.password) {
                done({ message: 'Password is required' });
            } else {
                done(null);
            }
        }, function (done) {
            userService.isUserExists(inputData.email, userId).then(function (data) {
                console.log('updateUser isUserExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('updateUser isUserExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            if(inputData.password) {
                delete inputData.password;
            }
            userService.updateUser(req.params.id, inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('updateUser err: ', err);
                done(err);
            });
        }
    ], function (err, userData) {
        if (err) {
            console.log('updateUser err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('updateUser data: ', userData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully updated user details.' }, result: { 'data': userData } });
        }
    });
}

// Add new user
// http://localhost:3000/api/user/add/
// Request: {"email":"rr12@imp.com","gender":"Female","is_active":true,"name":"admin","password":"admin","age":30,"contactInfo":{"primary_phone":"9876543452","alternate_phone":"00000"},"dob":"2018-12-24"}
// Response: {"success":{"message":"Successfully created user details."},"result":{"user":{"privileges":[],"_id":"5c94ac9d78afa81e8cf292d8","email":"rr12@imp.com","gender":"Female","is_active":true,"name":"admin","password":"admin","age":30,"contactInfo":{"primary_phone":9876543452,"alternate_phone":0},"dob":"2018-12-24T00:00:00.000Z","__v":0}}}
function addUser(req, res) {
    let inputData = req.body;
    async.waterfall([
        function (done) {
            if (!inputData.email) {
                done({ message: 'Email is required' });
            } else if (!inputData.password) {
                done({ message: 'Password is required' });
            } else {
                done(null);
            }
        }, function (done) {
            userService.isUserExists(inputData.email).then(function (data) {
                console.log('addUser isUserExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('addUser isUserExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            inputData.password = utilities.genearteHashForPassword(inputData.password);
            userService.addUser(inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('adduser err: ', err);
                done(err);
            });
        }
    ], function (err, userData) {
        if (err) {
            console.log('addUser err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('addUser data: ', userData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully created user details.' }, result: { 'data': userData } });
        }
    });
}


function updateBudgetById(req, res) {
    let inputData = req.body;
    let userId = req.params.id;
    async.waterfall([
         function (done) {
            userService.updateUser(req.params.id, inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('updateUser err: ', err);
                done(err);
            });
        }
    ], function (err, userData) {
        if (err) {
            console.log('updateUser err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('updateUser data: ', userData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully updated user details.' }, result: { 'data': userData } });
        }
    });
}

function getUserBudgetById(req, res) {
    userService.getUserBudgetById(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched user details.' }, result: { 'data': data } });
    }).catch((err) => {
        console.log('getUser err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}