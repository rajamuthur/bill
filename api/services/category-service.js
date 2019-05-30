

var categoryModel = require('../models/category-model');
var ObjectId = require('mongodb').ObjectID;
var service = {};
var defaultCategoryId = '';
service.addCategory = addCategory;
service.isCategoryExists = isCategoryExists;
service.getDefaultCategoryIdByName = getDefaultCategoryIdByName;
service.getAllCategory = getAllCategory;
service.updateCategory = updateCategory;
service.deleteCategory = deleteCategory;
service.getCategoryById = getCategoryById;
module.exports = service;

function addCategory(categoryData) {
    return new Promise(function (resolve, reject) {
        categoryModel.create(categoryData).then(function (data) {
            console.log('addCategory data: ', data, 'input categoryData: ', categoryData)
            if (Object.keys(data).length) {
                console.log('Successfully added category detail: ')
                resolve(data);
            } else {
                console.log('Failed to add category detail: Resp is empty: ')
                reject({ 'code': 500, 'message': 'Failed to add category details-1', 'data': [] });
            }
        }).catch((err) => {
            console.log('Failed to add category detail: err: ', err)
            reject({ 'code': 500, 'message': 'Failed to add category details-2', 'data': [] });
        })
    });
}

function getAllCategory() {
    return new Promise(function (resolve, reject) {
        categoryModel.find({}).then(function (data) {
            if (Object.keys(data).length > 0) {
                resolve(data);
            } else {
                reject({ 'code': 400, 'message': 'No records found', 'data': [] });
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to get all category details', 'data': [] });
        })
    });
}

function deleteCategory(categoryId) {
    return new Promise(function (resolve, reject) {
        categoryModel.findOneAndDelete({ _id: categoryId})
            .then(user => {
                console.log('deleteCategory: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'Category not found with id: ' + categoryId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to delete category with id: ' + categoryId, 'data': [] });
            });
    });
}

function updateCategory(categoryId, dataSet) {
    return new Promise(function (resolve, reject) {
        categoryModel.findOneAndUpdate({ _id: categoryId}, {
            $set: dataSet
        })
            .then(user => {
                console.log('updateCategory: ', user)
                if (!user) {
                    reject({ 'code': 400, 'message': 'Category not found with id: ' + categoryId, 'data': [] });
                }
                resolve(true);
            }).catch(err => {
                console.log('updateCategory err: ', err)
                reject({ 'code': 500, 'message': 'Failed to update category with id: ' + categoryId, 'data': [] });
            });
    });
}

function getCategoryById(categoryId) {
    return new Promise(function (resolve, reject) {
        categoryModel.find({ _id: categoryId})
            .then(categoryDetails => {
                console.log('getUserById: ', categoryDetails)
                if (!categoryDetails) {
                    reject({ 'code': 400, 'message': 'category details not found with id: ' + categoryId, 'data': [] });
                }
                resolve(categoryDetails);
            }).catch(err => {
                reject({ 'code': 500, 'message': 'Failed to get category details with id: ' + categoryId, 'data': [] });
            });
    });
}

function getDefaultCategoryIdByName(name) {    
    return new Promise(function (resolve, reject) {
        if(defaultCategoryId == '') {
            let sql = { $and: [ { name: { $eq: name } } ] };
            console.log("getCategoryByName sql: ", sql, name)
            categoryModel.find(sql).then(function (data) {
                console.log('getCategoryByName data: ', data)
                if (data.length > 0) {
                    defaultCategoryId = data[0]['_id'];
                    resolve(data[0]['_id']);
                } else {
                    resolve('');
                }
            }).catch((err) => {
                console.log('Failed to get category details by name:' + name +', err: ', err)
                resolve('');
            })
        } else {
            resolve(defaultCategoryId);
        }
    });
}

function isCategoryExists(name, categoryId) {
    return new Promise(function (resolve, reject) {
        let sql = { $and: [ { name: { $eq: name } } ] };
        if(categoryId && categoryId != '') {
            sql['$and'].push({ _id: { $ne: ObjectId(categoryId) } })
        }
        console.log("isCategoryExists sql: ", sql, name, categoryId)
        categoryModel.find(sql).then(function (data) {
            console.log('isCategoryExists data: ', data)
            if (data.length > 0) {
                reject({ 'code': 400, 'message': 'Category name id already exists', 'data': [] });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject({ 'code': 500, 'message': 'Failed to validate category details', 'data': [] });
        })
    });
}
