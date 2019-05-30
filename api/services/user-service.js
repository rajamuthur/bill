

var userModel = require('../models/user-model');
var ObjectId = require('mongodb').ObjectID;
var service = {};
service.authenticateUser = authenticateUser;
service.isUserExists = isUserExists;
service.addUser = addUser;
service.getAllUser = getAllUser;
service.updateUser = updateUser;
service.deleteUser = deleteUser;
service.getUserById = getUserById;
service.getUserBudgetById = getUserBudgetById;
module.exports = service;

function authenticateUser(email) {
    return new Promise(function (resolve, reject) {
        userModel.find({ "email": email }).then(function (data) {
            console.log('authenticateUser data: ', data, 'email:', email)
            if (data.length > 0) {
                console.log('authenticateUser resp: ', data)
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'Invalid email', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to validate', 'data': [] });
        })
    });
}

function isUserExists(email, excludeUserId) {
    return new Promise(function (resolve, reject) {
        let sql = { $and: [ { email: { $eq: email } } ] };
        if(excludeUserId && excludeUserId != '') {
            sql['$and'].push({ _id: { $ne: ObjectId(excludeUserId) } })
        }
        console.log("isUserExists sql: ", sql, email, excludeUserId)
        userModel.find(sql).then(function (data) {
            console.log('isUserExists data: ', data)
            if (data.length > 0) {
                reject({ 'code': 400, 'message': 'Email id already exists', 'data': [] });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to validate user details', 'data': [] });
        })
    });
}

function addUser(userData) {
    return new Promise(function (resolve, reject) {
        userModel.create(userData).then(function (data) {
            console.log('addUser data: ', data, 'input userData: ', userData)
            if (Object.keys(data).length) {
                console.log('Successfully added user detail: ')
                resolve(data);
            } else {
                console.log('Failed to add user detail: Resp is empty: ')
                reject({ 'code': 500, 'message': 'Failed to add user details-1', 'data': [] });
            }
        }).catch((err) => {
            console.log('Failed to add user detail: err: ', err)
            reject({ 'code': 500, 'message': 'Failed to add user details-2', 'data': [] });
        })
    });
}

function getAllUser() {
    return new Promise(function (resolve, reject) {
        userModel.find({}).then(function (data) {
            console.log('getAllUser data: ', data)
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get all user details', 'data': [] });
        })
    });
}

function deleteUser(userId) {
    return new Promise(function (resolve, reject) {
        userModel.findOneAndDelete({ _id: userId})
            .then(user => {
                console.log('deleteUser: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'User not found with id: ' + userId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to delete User with id: ' + userId, 'data': [] });
            });
    });
}

function updateUser(userId, dataSet) {
    return new Promise(function (resolve, reject) {
        userModel.findOneAndUpdate({ _id: userId}, {
            $set: dataSet
        })
            .then(user => {
                console.log('updateUser: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'User not found with id: ' + userId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                console.log('updateUser err: ', err)
                reject({ 'code': 500, 'message': 'Failed to update User with id: ' + userId, 'data': [] });
            });
    });
}

function getUserById(userId) {
    return new Promise(function (resolve, reject) {
        userModel.find({ _id: userId})
            .then(userDetails => {
                console.log('getUserById: ', userDetails)
                if (!userDetails) {
                    reject({ 'code': 400, 'message': 'User details not found with id: ' + userId, 'data': [] });
                }
                resolve(userDetails);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to get User details with id: ' + userId, 'data': [] });
            });
    });
}

function getUserBudgetById(userId) {
    return new Promise(function (resolve, reject) {
        userModel.find({ _id: userId}, {total: 1})
            .then(userDetails => {
                console.log('getUserById: ', userDetails)
                if (!userDetails) {
                    reject({ 'code': 400, 'message': 'User details not found with id: ' + userId, 'data': [] });
                }
                resolve(userDetails);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to get User details with id: ' + userId, 'data': [] });
            });
    });
}
