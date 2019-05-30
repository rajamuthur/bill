

var unitModel = require('../models/unit-model');
var ObjectId = require('mongodb').ObjectID;
var service = {};
service.addUnit = addUnit;
service.isUnitExists = isUnitExists;
service.getAllUnit = getAllUnit;
service.updateUnit = updateUnit;
service.deleteUnit = deleteUnit;
service.getUnitById = getUnitById;
module.exports = service;

function addUnit(unitData) {
    return new Promise(function (resolve, reject) {
        unitModel.create(unitData).then(function (data) {
            console.log('addUnit data: ', data, 'input unitData: ', unitData)
            if (Object.keys(data).length) {
                console.log('Successfully added unit detail: ')
                resolve(data);
            } else {
                console.log('Failed to add unit detail: Resp is empty: ')
                reject({ 'code': 500, 'message': 'Failed to add unit details-1', 'data': [] });
            }
        }).catch((err) => {
            console.log('Failed to add unit detail: err: ', err)
            reject({ 'code': 500, 'message': 'Failed to add unit details-2', 'data': [] });
        })
    });
}

function getAllUnit() {
    return new Promise(function (resolve, reject) {
        unitModel.find({}).then(function (data) {
            console.log('getAllUnit data: ', data)
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get all unit details', 'data': [] });
        })
    });
}

function deleteUnit(unitId) {
    return new Promise(function (resolve, reject) {
        unitModel.findOneAndDelete({ _id: unitId})
            .then(user => {
                console.log('deleteUnit: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'Unit not found with id: ' + unitId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to delete unit with id: ' + unitId, 'data': [] });
            });
    });
}

function updateUnit(unitId, dataSet) {
    return new Promise(function (resolve, reject) {
        unitModel.findOneAndUpdate({ _id: unitId}, {
            $set: dataSet
        })
            .then(user => {
                console.log('updateUnit: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'Unit not found with id: ' + unitId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                console.log('updateUnit err: ', err)
                reject({ 'code': 500, 'message': 'Failed to update unit with id: ' + unitId, 'data': [] });
            });
    });
}

function getUnitById(unitId) {
    return new Promise(function (resolve, reject) {
        unitModel.find({ _id: unitId})
            .then(unitDetails => {
                console.log('getUserById: ', unitDetails)
                if (!unitDetails) {
                    reject({ 'code': 400, 'message': 'unit details not found with id: ' + unitId, 'data': [] });
                }
                resolve(unitDetails);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to get unit details with id: ' + unitId, 'data': [] });
            });
    });
}


function isUnitExists(name, unitId) {
    return new Promise(function (resolve, reject) {
        let sql = { $and: [ { name: { $eq: name } } ] };
        if(unitId && unitId != '') {
            sql['$and'].push({ _id: { $ne: ObjectId(unitId) } })
        }
        console.log("isUnitExists sql: ", sql, name, unitId)
        unitModel.find(sql).then(function (data) {
            console.log('isUnitExists data: ', data)
            if (data.length > 0) {
                reject({ 'code': 400, 'message': 'Unit name id already exists', 'data': [] });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to validate unit details', 'data': [] });
        })
    });
}
