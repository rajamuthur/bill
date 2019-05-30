

var itemModel = require('../models/item-model');
var ObjectId = require('mongodb').ObjectID;
var service = {};
service.addItem = addItem;
service.isItemExists = isItemExists;
service.getAllItem = getAllItem;
service.getAllItemByName = getAllItemByName;
service.updateItem = updateItem;
service.deleteItem = deleteItem;
service.getItemById = getItemById;
service.getAllItemBySearch = getAllItemBySearch;
module.exports = service;

function addItem(itemData) {
    return new Promise(function (resolve, reject) {
        itemModel.create(itemData).then(function (data) {
            console.log('addItem data: ', data, 'input itemData: ', itemData)
            if (Object.keys(data).length) {
                console.log('Successfully added item detail: ', data)
                resolve(data);
            } else {
                console.log('Failed to add item detail: Resp is empty: ')
                reject({ 'code': 500, 'message': 'Failed to add item details-1', 'data': [] });
            }
        }).catch((err) => {
            console.log('Failed to add item detail: err: ', err)
            reject({ 'code': 500, 'message': 'Failed to add item details-2', 'data': [] });
        })
    });
}

function getAllItem() {
    return new Promise(function (resolve, reject) {
        itemModel.find({}).then(function (data) {
            console.log('getAllItem data: ', data)
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get all item details', 'data': [] });
        })
    });
}

// Ex: db.items.find(
//     { $or: [
//         {
//             $and: [ { is_approved: true },  { name: { $regex: `.*j.*`, $options: 'si' } } ]
//         },
//         {
//             _id : { $in: [ObjectId("5cdac12db3deae40c8fbd2d5"), ObjectId("5ccfed6b1c9d440000291bda")] } 
//         }
//     ]})
function getAllItemByName(name, itemIds = []) {
    return new Promise(function (resolve, reject) {
        console.log('getAllItemByName data: ', name, 'itemIds:', itemIds)

        itemModel.find({
            $or: [
                {
                    $and: [{ is_approved: true }, { name: { $regex: `.*${name}.*`, $options: 'si' } }]
                },
                {
                    _id: { $in: itemIds }
                }
            ]
        }).then(function (data) {
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            console.log('err:', err)
            reject({ 'code': 500, 'message': 'Failed to get all item details by name:' + name, 'data': [] });
        })
    });
}

function getAllItemBySearch(searchData) {
    return new Promise(function (resolve, reject) {
        console.log('getAllItemBySearch searchData: ', searchData)

        itemModel.find(searchData).then(function (data) {
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            console.log('err:', err)
            reject({ 'code': 500, 'message': 'Failed to get all item details with search:', searchData, 'data': [] });
        })
    });
}

function deleteItem(itemId) {
    return new Promise(function (resolve, reject) {
        itemModel.findOneAndDelete({ _id: itemId })
            .then(user => {
                console.log('deleteItem: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'Item not found with id: ' + itemId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to delete item with id: ' + itemId, 'data': [] });
            });
    });
}

function updateItem(itemId, dataSet) {
    return new Promise(function (resolve, reject) {
        itemModel.findOneAndUpdate({ _id: itemId }, {
            $set: dataSet
        })
            .then(user => {
                console.log('updateItem: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'Item not found with id: ' + itemId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                console.log('updateItem err: ', err)
                reject({ 'code': 500, 'message': 'Failed to update item with id: ' + itemId, 'data': [] });
            });
    });
}

function getItemById(itemId) {
    return new Promise(function (resolve, reject) {
        itemModel.find({ _id: itemId })
            .then(itemDetails => {
                console.log('getUserById: ', itemDetails)
                if (!itemDetails) {
                    reject({ 'code': 400, 'message': 'item details not found with id: ' + itemId, 'data': [] });
                }
                resolve(itemDetails);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to get item details with id: ' + itemId, 'data': [] });
            });
    });
}


function isItemExists(name, itemId) {
    return new Promise(function (resolve, reject) {
        let sql = { $and: [{ name: { $eq: name } }] };
        if (itemId && itemId != '') {
            sql['$and'].push({ _id: { $ne: ObjectId(itemId) } })
        }
        console.log("isItemExists sql: ", sql, name, itemId)
        itemModel.find(sql).then(function (data) {
            console.log('isItemExists data: ', data)
            if (data.length > 0) {
                reject({ 'code': 400, 'message': 'Item name already exists', 'data': data });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to validate item details', 'data': [] });
        })
    });
}


