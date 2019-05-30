

var userService = require('../services/user-service');
var roleService = require('../services/role-service');
var utilities = require('../../common/utilities');
const config = require('../../config');
var utilities = require('../../common/utilities');
const STATUS_CODE = config.APP_CONSTANTS.STATUS_CODE;
const async = require('async');
var loginFn = {};
loginFn.validateUser = validateUser;
loginFn.signup = signup;
module.exports = loginFn;

// User Login
// POST /auth/login
// Input: {"email":"admin@mail.com"," password":"password"}
// Output (Success): {"success":{"message":"Authentication success."},"result":{"user":{"address":{"address_line_1":"Impiger Technologies Pvt. Ltd.","address_line_2":"","city":"city","state":"state","zipcode":75632456},"contactInfo":{"primary_phone":1234567890,"alternate_phone":1234567891,"extension":738,"fax":"1-408-999 8888"},"privileges":[{"_id":"1","privilege":"View Dashboard"},{"_id":"2","privilege":"View Users"},{"_id":"3","privilege":"Edit User"},{"_id":"4","privilege":"Create Event"},{"_id":"5","privilege":"Edit Event"},{"_id":"6","privilege":"View Event"},{"_id":"7","privilege":"View Contribution"}],"_id":"5c8a5f8680923718b491374a","name":"admin","password":"admin","gender":"male","age":27,"email":"admin@imp.com","dob":"2019-03-14T14:04:54.976Z","imgPath":"admin.jpg","status":true,"regdate":"2019-03-14T14:04:54.976Z","date_updated":"2019-03-14T14:04:54.976Z","group":"customer","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWRtaW5AaW1wLmNvbSIsImlhdCI6MTU1MjY1NzUxM30.C9Qd8ZxiMUXiZxg8FfcWBRA9huOxyNYEmqy2WLFrs1A"}}}
// Output (Fail): {"error":{"message":"Authentication failed, Incorrect Password."}}
function validateUser(req, res, next) {
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
            userService.authenticateUser(inputData.email).then(function (data) {
                done(null, inputData, data[0]);
            }).catch((err) => {
                console.log('validateUser authenticateUser err: ', err);
                done(err)
            });
        }, function(inputData, userData, done) {
            let isValid = utilities.validatePassword(inputData.password, userData.password);
            console.log('validateUser validatePassword: ', inputData.password, userData.password, isValid);
            if(isValid) {                
                done(null, userData);
            } else {
                console.log('Invalid password: ', inputData.password, userData.password, isValid);
                done({ 'code': 400, 'message': 'Invalid password', 'data': [] });
            }
        }, function(userData, done) {
            roleService.getRoles(userData.group).then(function (pvData) {
                userData['privileges'] = pvData;
                done(null, userData);
            }).catch((err) => {
                console.log('validateUser getRoles err: ', err);
                done(err);
            });
        }, function(userData, done) {
            let tokenUserData = {'email': userData['email'], 'id': userData['_id'], 'group': userData['group']}
            let token = utilities.getNewToken(tokenUserData);
            userData['token'] = token;
            done(null, userData);
        }
    ], function (err, userData) {
        if (err) {
            console.log('validateUser err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('validateUser final userData: ', userData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Authentication success.' }, result: { user: userData } });
        }
    });
}

// User Login
// POST /auth/login
// Input: {"email":"admin@mail.com"," password":"password"}
// Output (Success): {"success":{"message":"User Created."},"result":{"user":{"privileges":[],"_id":"5c8bacda3c08673144d9a2c7","email":"raja8@imp.com","password":"admin","__v":0}}}
// Output (Fail): {"error":{"message":"Failed to create user, Email id already exists."}}
function signup(req, res, next) {
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
                console.log('signup isUserExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('signup isUserExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            userService.addUser(inputData).then(function (data) {
                console.log('signup addUser success: ', data, 'isExists: ', isExists);
                done(null, data);
            }).catch((err) => {
                console.log('signup addUser err: ', err);
                done(err);
            });
        }
    ], function (err, userData) {
        if (err) {
            console.log('signup err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('signup data: ', userData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'User Created.' }, result: { user: userData } });
        }
    });
}