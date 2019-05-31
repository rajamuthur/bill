

var billModel = require('../models/bill-model');
var ObjectId = require('mongodb').ObjectID;
var utilities = require('../../common/utilities');
var service = {};
service.addBill = addBill;
service.getAllBills = getAllBills;
service.updateBill = updateBill;
service.deleteBill = deleteBill;
service.getBillBySearch = getBillBySearch;
service.getBillById = getBillById;
module.exports = service;

function addBill(billData) {
    return new Promise(function (resolve, reject) {
        billModel.create(billData).then(function (data) {
            console.log('addBill data: ', data, 'input billData: ', billData)
            if (Object.keys(data).length) {
                console.log('Successfully added bill detail: ')
                resolve(data);
            } else {
                console.log('Failed to add bill detail: Resp is empty: ')
                reject({ 'code': 500, 'message': 'Failed to add bill details-1', 'data': [] });
            }
        }).catch((err) => {
            console.log('Failed to add bill detail: err: ', err)
            reject({ 'code': 500, 'message': 'Failed to add bill details-2', 'data': [] });
        })
    });
}

function getBillBySearch(searchData) {
    let collectionFields = utilities.getFieldListBySchema(billModel.schema);
    let searchCondition = utilities.getSearchCondition(searchData, collectionFields);
    console.log('getBillBySearch searchCondition: ',searchCondition, 'searchData:', searchData, 'collectionFields:', collectionFields)
    return new Promise(function (resolve, reject) {
        billModel.find(searchCondition).then(function (data) {
            console.log('getBillBySearch data: ', data)
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                resolve([]);
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get all bill details with search', 'data': [] });
        })
    });
}

function getAllBills() {
    return new Promise(function (resolve, reject) {
        billModel.find({}).then(function (data) {
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get all bill details', 'data': [] });
        })
    });
}

function deleteBill(billId) {
    return new Promise(function (resolve, reject) {
        billModel.findOneAndDelete({ _id: billId})
            .then(bill => {
                console.log('deleteBill: ', bill)
                if (!bill) {
                    reject({ 'code': 400, 'message': 'Bill not found with id: ' + billId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to delete bill with id: ' + billId, 'data': [] });
            });
    });
}

function updateBill(billId, dataSet) {
    console.log('updateBill dataSet:', dataSet)
    return new Promise(function (resolve, reject) {
        billModel.findOneAndUpdate({ _id: billId}, {
            $set: dataSet
        })
            .then(bill => {
                console.log('updateCategory: ', bill)
                if (!bill) {
                    reject({ 'code': 400, 'message': 'Bill not found with id: ' + billId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                console.log('updateCategory err: ', err)
                reject({ 'code': 500, 'message': 'Failed to update bill with id: ' + billId, 'data': [] });
            });
    });
}

function getBillById(billId) {
    return new Promise(function (resolve, reject) {
        billModel.find({ _id: billId})
            .then(billDetails => {
                console.log('getBillById: ', billDetails)
                if (!billDetails) {
                    reject({ 'code': 400, 'message': 'bill details not found with id: ' + billId, 'data': [] });
                }
                resolve(billDetails);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to get bill details with id: ' + billId, 'data': [] });
            });
    });
}

