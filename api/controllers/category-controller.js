

var categoryService = require('../services/category-service');
const config = require('../../config');
const STATUS_CODE = config.APP_CONSTANTS.STATUS_CODE;
const async = require('async');
var categoryController = {};
categoryController.getAllCategory = getAllCategory;
categoryController.deleteCategory = deleteCategory;
categoryController.getCategoryById = getCategoryById;
categoryController.updateCategory = updateCategory;
categoryController.addCategory = addCategory;
module.exports = categoryController;

// Get category List
// POST /category
// Output (Success): {"success":{"message":"Category details."},"result":{"category":{"address":{"address_line_1":"Impiger Technologies Pvt. Ltd.","address_line_2":"","city":"city","state":"state","zipcode":75632456},"contactInfo":{"primary_phone":1234567890,"alternate_phone":1234567891,"extension":738,"fax":"1-408-999 8888"},"privileges":[{"_id":"1","privilege":"View Dashboard"},{"_id":"2","privilege":"View Users"},{"_id":"3","privilege":"Edit User"},{"_id":"4","privilege":"Create Event"},{"_id":"5","privilege":"Edit Event"},{"_id":"6","privilege":"View Event"},{"_id":"7","privilege":"View Contribution"}],"_id":"5c8a5f8680923718b491374a","name":"admin","password":"admin","gender":"male","age":27,"email":"admin@imp.com","dob":"2019-03-14T14:04:54.976Z","imgPath":"admin.jpg","status":true,"regdate":"2019-03-14T14:04:54.976Z","date_updated":"2019-03-14T14:04:54.976Z","group":"customer","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiYWRtaW5AaW1wLmNvbSIsImlhdCI6MTU1MjY1NzUxM30.C9Qd8ZxiMUXiZxg8FfcWBRA9huOxyNYEmqy2WLFrs1A"}}}
// Output (Fail): {"error":{"message":"Failed to get category details"}}
function getAllCategory(req, res, next) {
    async.waterfall([
        function (done) {
            categoryService.getAllCategory().then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('getAllCategory err: ', err);
                done(err)
            });
        }
    ], function (err, categoryData) {
        if (err) {
            console.log('getAllCategory err: ', err);
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('getAllCategory final Data: ', JSON.stringify(categoryData));
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully  fetched all category details.' }, result: { 'data': categoryData } });
        }
    });
}

function deleteCategory(req, res) {
    categoryService.deleteCategory(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully delete category.' } });
    }).catch((err) => {
        console.log('deleteCategory err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

function getCategoryById(req, res) {
    categoryService.getCategoryById(req.params.id).then(function (data) {
        return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully fetched category details.' }, result: { 'data': data} });
    }).catch((err) => {
        console.log('getUser err: ', err);
        return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });

    });
}

// Update cateogry details
// URL: http://localhost:3000/api/category/5c8b98f83a4a254ae8f0f8c7/
// Request: {"name":"Veg","description":"Veg"}
// Response: {"success":{"message":"Successfully updated category details."},"result":{"category":true}}
function updateCategory(req, res) {
    let inputData = req.body;
    let categoryId = req.params.id;
    async.waterfall([
        function (done) {
            if (!inputData.name) {
                done({ message: 'Name is required' });
            } else if (!inputData.description) {
                done({ message: 'Description is required' });
            } else {
                done(null);
            }
        }, function (done) {
            categoryService.isCategoryExists(inputData.name, categoryId).then(function (data) {
                console.log('updateUser isCategoryExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('updateUser isCategoryExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {           
            categoryService.updateCategory(req.params.id, inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('updateCategory err: ', err);
                done(err);
            });
        }
    ], function (err, categoryData) {
        if (err) {
            console.log('updateCategory err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('updateCategory data: ', categoryData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully updated category details.' }, result: { 'data': categoryData } });
        }
    });
}

// Add new category
// http://localhost:3000/api/category/add/
// Request: {"name":"medical","description":"medical details"}
// Response: {"success":{"message":"Successfully created category details."},"result":{"category":{"_id":"5c94ac9d78afa81e8cf292d8","name":"medical","description":"medical details"}}
function addCategory(req, res) {
    let inputData = req.body;
    async.waterfall([
        function (done) {
            if (!inputData.name) {
                done({ message: 'Name is required' });
            } else if (!inputData.description) {
                done({ message: 'Description is required' });
            } else {
                done(null);
            }
        }, function (done) {
            categoryService.isCategoryExists(inputData.name).then(function (data) {
                console.log('addUser isCategoryExists success: ', data);
                done(null, data);
            }).catch((err) => {
                console.log('addUser isCategoryExists err: ', err);
                done(err);
            });
        }, function (isExists, done) {
            categoryService.addCategory(inputData).then(function (data) {
                done(null, data);
            }).catch((err) => {
                console.log('addCategory err: ', err);
                done(err);
            });
        }
    ], function (err, categoryData) {
        if (err) {
            console.log('addCategory err: ', err)
            if (err.code && err.code > 0) {
                return res.status(err.code).json({ error: { message: err.message }, error_info: err.info });
            } else {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ error: { message: err.message }, error_info: err.info });
            }
        } else {
            console.log('addCategory data: ', categoryData);
            return res.status(STATUS_CODE.SUCCESS).json({ success: { message: 'Successfully created category details.' }, result: { 'data': categoryData } });
        }
    });
}